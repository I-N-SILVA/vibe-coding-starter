"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/shared/ui/table';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shared/ui/select';

type Invite = {
    id: string;
    email: string;
    type: string;
    status: string;
    expires_at: string;
    invited_role: string;
};

export default function InvitationsPage() {
    const { organizationId } = useParams();
    const [invites, setInvites] = useState<Invite[]>([]);
    const [newInvite, setNewInvite] = useState({
        email: '',
        type: 'player_join',
        role: 'player',
    });

    useEffect(() => {
        fetchInvites();
    }, [organizationId]);

    const fetchInvites = async () => {
        const response = await fetch(`/api/league/invites`);
        if (response.ok) {
            const data = await response.json();
            setInvites(data);
        }
    };

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch(`/api/league/invites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newInvite),
        });
        fetchInvites();
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-4">Invitations</h1>
            
            <form onSubmit={handleSendInvite} className="mb-8 p-4 border rounded-lg">
                <h2 className="text-xl font-bold mb-4">Send New Invite</h2>
                <div className="flex gap-4">
                    <Input
                        placeholder="Email"
                        type="email"
                        value={newInvite.email}
                        onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                        required
                    />
                    <Select onValueChange={(value) => setNewInvite({ ...newInvite, role: value })} defaultValue={newInvite.role}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="referee">Referee</SelectItem>
                            <SelectItem value="player">Player</SelectItem>
                            <SelectItem value="fan">Fan</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button type="submit">Send Invite</Button>
                </div>
            </form>

            <h2 className="text-xl font-bold mb-4">Sent Invitations</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invites.map((invite) => (
                        <TableRow key={invite.id}>
                            <TableCell>{invite.email}</TableCell>
                            <TableCell>{invite.invited_role}</TableCell>
                            <TableCell>{invite.status}</TableCell>
                            <TableCell>{new Date(invite.expires_at).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
