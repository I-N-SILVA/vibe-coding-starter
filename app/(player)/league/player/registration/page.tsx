'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Camera, Database, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
    Input,
    Select,
    Modal,
} from '@/components/plyaz';
import { playerNavItems } from '@/lib/constants/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useCompetitions } from '@/lib/hooks/use-competitions';
import { createClient } from '@/lib/supabase/client';
import { apiClient } from '@/lib/api';
import { Competition } from '@/lib/supabase/types';

type RegistrationField = {
    id: string;
    field_name: string;
    field_type: 'text' | 'number' | 'date' | 'select';
    is_required: boolean;
    options?: string[];
};

const POSITIONS = [
    { value: 'GK', label: 'Goalkeeper' },
    { value: 'CB', label: 'Centre Back' },
    { value: 'LB', label: 'Left Back' },
    { value: 'RB', label: 'Right Back' },
    { value: 'CDM', label: 'Defensive Mid' },
    { value: 'CM', label: 'Central Mid' },
    { value: 'CAM', label: 'Attacking Mid' },
    { value: 'LM', label: 'Left Mid' },
    { value: 'RM', label: 'Right Mid' },
    { value: 'LW', label: 'Left Wing' },
    { value: 'RW', label: 'Right Wing' },
    { value: 'ST', label: 'Striker' },
    { value: 'CF', label: 'Center Forward' },
];

const DOC_TYPES = [
    { value: 'passport', label: 'Passport' },
    { value: 'national_id', label: 'National ID' },
    { value: 'birth_certificate', label: 'Birth Certificate' },
    { value: 'other', label: 'Other' },
];

const supabase = createClient();

export default function PlayerRegistration() {
    const { profile } = useAuth();
    const queryClient = useQueryClient();
    const toast = useToast();

    const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        team_id: '',
        player_id: '',
        id_document_type: 'passport',
        id_document_number: '',
        full_name: profile?.full_name || '',
        date_of_birth: '',
        jersey_number: '',
        position: '',
        custom_fields: {} as Record<string, string | number>,
        // KYC / minor fields
        guardian_name: '',
        guardian_email: '',
        guardian_phone: '',
        guardian_relation: '',
        image_rights_confirmed: false,
        data_consent_confirmed: false,
    });

    const isMinor = useMemo(() => {
        if (!formData.date_of_birth) return false;
        const dob = new Date(formData.date_of_birth);
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return age < 18;
    }, [formData.date_of_birth]);

    // 1. Fetch available competitions
    const { data: competitions, isLoading: isLoadingComps } = useCompetitions();

    // 2. Fetch player's records tied to their profile
    const { data: myPlayers } = useQuery({
        queryKey: ['my-player-records', profile?.id],
        queryFn: async () => {
            if (!profile?.id) return [];
            const { data, error } = await supabase
                .from('players')
                .select('*, team:teams(*)')
                .eq('profile_id', profile.id);
            if (error) throw error;
            return data || [];
        },
        enabled: !!profile?.id
    });

    // 3. Fetch player's existing registrations
    const { data: myRegistrations, isLoading: isLoadingRegs } = useQuery({
        queryKey: ['my-registrations', profile?.id],
        queryFn: async () => {
            if (!myPlayers?.length) return [];
            const playerIds = myPlayers.map(p => p.id);
            const { data, error } = await supabase
                .from('competition_registrations')
                .select('*')
                .in('player_id', playerIds);
            if (error) throw error;
            return data || [];
        },
        enabled: !!myPlayers?.length
    });

    // 4. Fetch custom fields for selected competition
    const { data: customFields } = useQuery({
        queryKey: ['competition-fields', selectedComp?.id],
        queryFn: async () => {
            const data = await apiClient.get(`/api/league/competitions/${selectedComp?.id}/registration-fields`);
            return (data || []) as RegistrationField[];
        },
        enabled: !!selectedComp?.id
    });

    type RegistrationPayload = Omit<typeof formData, 'jersey_number'> & { jersey_number: number | null };

    // 5. Submit Registration
    const submitMutation = useMutation({
        mutationFn: (payload: RegistrationPayload) => apiClient.post(`/api/league/competitions/${selectedComp?.id}/registrations`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
            setIsModalOpen(false);
            setFormData({
                team_id: '', player_id: '', id_document_type: 'passport', id_document_number: '',
                full_name: profile?.full_name || '', date_of_birth: '', jersey_number: '', position: '', custom_fields: {},
                guardian_name: '', guardian_email: '', guardian_phone: '', guardian_relation: '',
                image_rights_confirmed: false, data_consent_confirmed: false,
            });
        }
    });

    const activeCompetitions = (competitions as Competition[])?.filter((c) => c.status === 'active' || c.status === 'draft') || [];

    const handleOpenRegister = (comp: Competition) => {
        setSelectedComp(comp);
        setIsModalOpen(true);
        if (myPlayers && myPlayers.length === 1) {
            setFormData((prev) => ({ ...prev, player_id: myPlayers[0].id, team_id: myPlayers[0].team_id }));
        }
    };

    const handleCustomFieldChange = (field_name: string, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            custom_fields: { ...prev.custom_fields, [field_name]: value }
        }));
    };

    // Handle payment success from URL — runs once on mount only
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            toast.success('Registration and payment successful!');
            window.history.replaceState({}, '', window.location.pathname);
        } else if (params.get('canceled') === 'true') {
            toast.error('Payment was canceled.');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const comp = selectedComp;
        if (!comp) return;

        if (isMinor && (!formData.guardian_email || !formData.guardian_name || !formData.guardian_relation)) {
            toast.error('Please complete all guardian details for this under-18 player.');
            return;
        }
        if (isMinor && (!formData.image_rights_confirmed || !formData.data_consent_confirmed)) {
            toast.error('Both consent boxes must be ticked for under-18 registrations.');
            return;
        }

        const payload = {
            ...formData,
            jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
            is_minor: isMinor,
        };

        // If paid competition, redirect to Stripe
        if ((comp.registration_fee ?? 0) > 0) {
            try {
                const response = await fetch('/api/stripe/registration-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        competition_id: comp.id,
                        player_id: formData.player_id,
                        team_id: formData.team_id,
                        metadata: formData.custom_fields
                    })
                });

                const data = await response.json() as { url?: string; error?: string };
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    toast.error(data.error || 'Failed to start checkout');
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Payment failed to initialize');
            }
            return;
        }

        submitMutation.mutate(payload);
    };

    return (
        <PageLayout navItems={playerNavItems} title="REGISTRATIONS">
            <PageHeader
                label="Registrations"
                title="Available Competitions"
                description="View and register for upcoming leagues and tournaments."
            />

            <div className="max-w-4xl mx-auto pb-24 space-y-6">
                {isLoadingComps || isLoadingRegs ? (
                    <div className="flex justify-center p-12">
                        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    </div>
                ) : activeCompetitions.length === 0 ? (
                    <Card><CardContent className="p-12 text-center text-gray-500">No active competitions available.</CardContent></Card>
                ) : (
                    activeCompetitions.map((comp: Competition) => {
                        const registration = myRegistrations?.find((r: { competition_id: string }) => r.competition_id === comp.id);
                        return (
                            <motion.div key={comp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="overflow-hidden border-gray-200">
                                    <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-black">{comp.name}</h3>
                                                <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold tracking-wider uppercase rounded">
                                                    {comp.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">{comp.description || 'No description provided.'}</p>

                                            <div className="flex gap-4 text-xs font-medium text-gray-400">
                                                <span>Season: {comp.season || comp.year}</span>
                                                {comp.start_date && <span>Starts: {new Date(comp.start_date).toLocaleDateString()}</span>}
                                                {(comp.registration_fee ?? 0) > 0 ? (
                                                    <span className="text-orange-500 font-bold">Fee: £{comp.registration_fee}</span>
                                                ) : (
                                                    <span className="text-green-600 font-bold">Free Entry</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                            {registration ? (
                                                <div className="text-center w-full">
                                                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${registration.status === 'approved' ? 'text-green-600' :
                                                        registration.status === 'rejected' ? 'text-red-600' : 'text-orange-500'
                                                        }`}>
                                                        {registration.status}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400">
                                                        Applied: {new Date(registration.registered_at).toLocaleDateString()}
                                                    </p>
                                                    {registration.status === 'rejected' && (
                                                        <Button size="sm" variant="secondary" className="mt-2 w-full text-xs" onClick={() => handleOpenRegister(comp)}>
                                                            Re-apply
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-full">
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Not Registered</div>
                                                    <Button onClick={() => handleOpenRegister(comp)} className="w-full bg-black text-white hover:bg-orange-600">
                                                        Register Now
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Competition Registration" size="lg">
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6 flex justify-between items-center">
                        {selectedComp && (
                            <>
                                <div>
                                    <h4 className="text-sm font-bold text-orange-900 mb-1">Applying for: {selectedComp.name}</h4>
                                    <p className="text-xs text-orange-700">Please ensure all your details strictly match your official ID document.</p>
                                </div>
                                {(selectedComp.registration_fee ?? 0) > 0 && (
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold">Registration Fee</p>
                                        <p className="text-xl font-black text-orange-600">£{selectedComp.registration_fee}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {(!myPlayers || myPlayers.length === 0) ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
                            You are not assigned to any teams yet. You must be added to a team to register.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Select Your Team Profile"
                                    required
                                    value={formData.player_id}
                                    onChange={(e) => {
                                        const pId = e.target.value;
                                        const player = myPlayers.find(p => p.id === pId);
                                        setFormData({ ...formData, player_id: pId, team_id: player?.team_id || '' });
                                    }}
                                    options={[
                                        { value: '', label: 'Select Team...' },
                                        ...myPlayers.map(p => ({
                                            value: p.id,
                                            label: p.team?.name ? `${p.team.name} (${p.name})` : p.name
                                        }))
                                    ]}
                                />
                                <Input
                                    label="Full Identity Name"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Document Type"
                                    required
                                    value={formData.id_document_type}
                                    onChange={(e) => setFormData({ ...formData, id_document_type: e.target.value })}
                                    options={DOC_TYPES}
                                />
                                <Input
                                    label="Document Number"
                                    required
                                    value={formData.id_document_number}
                                    onChange={(e) => setFormData({ ...formData, id_document_number: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Date of Birth"
                                    type="date"
                                    required
                                    value={formData.date_of_birth}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                />
                                <Select
                                    label="Position (Optional)"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    options={[{ value: '', label: 'None' }, ...POSITIONS]}
                                />
                                <Input
                                    label="Jersey # (Optional)"
                                    type="number"
                                    min="1" max="99"
                                    value={formData.jersey_number}
                                    onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                                />
                            </div>

                            {/* KYC / Minor Section — shown automatically when DOB indicates under-18 */}
                            {isMinor && (
                                <div className="pt-4 border-t-2 border-orange-200 space-y-5">
                                    <div className="flex items-start gap-3 bg-orange-50 rounded-2xl p-4">
                                        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-orange-900">Under-18 Player</p>
                                            <p className="text-xs text-orange-700 mt-0.5">
                                                A parent or guardian must provide consent. We will send them an email with a consent link after you submit.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-1">
                                        <ShieldCheck className="w-4 h-4 text-orange-500" />
                                        <h4 className="text-sm font-bold text-gray-900">Parent / Guardian Details</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Guardian Full Name"
                                            required
                                            value={formData.guardian_name}
                                            onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                                        />
                                        <Input
                                            label="Guardian Email"
                                            type="email"
                                            required
                                            value={formData.guardian_email}
                                            onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Guardian Phone (optional)"
                                            type="tel"
                                            value={formData.guardian_phone}
                                            onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                                        />
                                        <Select
                                            label="Relationship to Player"
                                            required
                                            value={formData.guardian_relation}
                                            onChange={(e) => setFormData({ ...formData, guardian_relation: e.target.value })}
                                            options={[
                                                { value: '', label: 'Select...' },
                                                { value: 'parent', label: 'Parent' },
                                                { value: 'legal_guardian', label: 'Legal Guardian' },
                                                { value: 'grandparent', label: 'Grandparent' },
                                                { value: 'other', label: 'Other (please specify in notes)' },
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${formData.image_rights_confirmed ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
                                            <input
                                                type="checkbox"
                                                required
                                                checked={formData.image_rights_confirmed}
                                                onChange={(e) => setFormData({ ...formData, image_rights_confirmed: e.target.checked })}
                                                className="mt-0.5 w-4 h-4 accent-orange-600 flex-shrink-0"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Camera className="w-3.5 h-3.5 text-orange-500" />
                                                    <p className="text-xs font-bold text-gray-900">Image & Video Rights</p>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    I confirm the parent/guardian grants image and video rights for this player to appear in official match coverage, social media, and league publications.
                                                </p>
                                            </div>
                                        </label>

                                        <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${formData.data_consent_confirmed ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
                                            <input
                                                type="checkbox"
                                                required
                                                checked={formData.data_consent_confirmed}
                                                onChange={(e) => setFormData({ ...formData, data_consent_confirmed: e.target.checked })}
                                                className="mt-0.5 w-4 h-4 accent-orange-600 flex-shrink-0"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Database className="w-3.5 h-3.5 text-orange-500" />
                                                    <p className="text-xs font-bold text-gray-900">Data Processing Consent</p>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    I confirm the parent/guardian consents to this player's personal data being processed for league administration purposes in accordance with GDPR and the UK Data Protection Act 2018.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Custom Fields */}
                            {customFields && customFields.length > 0 && (
                                <div className="pt-4 border-t border-gray-100 space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900 mb-2">Additional Information</h4>
                                    {customFields.map((field: RegistrationField) => (
                                        <div key={field.id}>
                                            {field.field_type === 'text' && (
                                                <Input
                                                    label={field.field_name}
                                                    required={field.is_required}
                                                    value={formData.custom_fields[field.field_name] || ''}
                                                    onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
                                                />
                                            )}
                                            {field.field_type === 'number' && (
                                                <Input
                                                    type="number"
                                                    label={field.field_name}
                                                    required={field.is_required}
                                                    value={formData.custom_fields[field.field_name] || ''}
                                                    onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
                                                />
                                            )}
                                            {field.field_type === 'date' && (
                                                <Input
                                                    type="date"
                                                    label={field.field_name}
                                                    required={field.is_required}
                                                    value={formData.custom_fields[field.field_name] || ''}
                                                    onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
                                                />
                                            )}
                                            {field.field_type === 'select' && (
                                                <Select
                                                    label={field.field_name}
                                                    required={field.is_required}
                                                    value={formData.custom_fields[field.field_name] || ''}
                                                    onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
                                                    options={[
                                                        { value: '', label: 'Select...' },
                                                        ...(field.options?.map((o: string) => ({ value: o, label: o })) || [])
                                                    ]}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-4 pt-6">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1 border-0 bg-gray-50"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={submitMutation.isPending}
                                    className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                                    disabled={!formData.player_id}
                                >
                                    Submit Registration
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </Modal>
        </PageLayout>
    );
}
