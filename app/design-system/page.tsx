'use client';

import React, { useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    Badge,
    StatusBadge,
    MatchCard,
    StatCard,
    TeamCard,
    PlayerCard,
    Modal,
    ConfirmModal,
    Input,
    Select,
    Toggle,
} from '@/components/plyaz';

/**
 * PLYAZ Design System Demo Page (Refined)
 * Premium black/white aesthetic with orange accents on hover
 */

export default function DesignSystemPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [toggleValue, setToggleValue] = useState(false);

    // Demo data
    const homeTeam = { id: '1', name: 'FC United', shortName: 'FCU' };
    const awayTeam = { id: '2', name: 'City Rangers', shortName: 'CRG' };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-100 sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-8 py-6">
                    <h1 className="text-xs font-medium tracking-[0.2em] uppercase text-gray-900">
                        PLYAZ <span className="text-gray-400">Design System</span>
                    </h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-8 py-16 space-y-20">
                {/* Buttons Section */}
                <section>
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400 mb-8">
                        Buttons
                    </h2>
                    <Card>
                        <CardContent>
                            <p className="text-xs text-gray-400 mb-6">
                                Hover to see orange accent effects
                            </p>
                            <div className="flex flex-wrap gap-4 items-center">
                                <Button variant="primary">Primary</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="danger">Danger</Button>
                                <Button variant="primary" isLoading>
                                    Loading
                                </Button>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <Button variant="primary" size="lg">
                                    Large Button (60px)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Badges Section */}
                <section>
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400 mb-8">
                        Badges
                    </h2>
                    <Card>
                        <CardContent>
                            <div className="flex flex-wrap gap-4 items-center">
                                <Badge variant="default">Default</Badge>
                                <Badge variant="primary">Primary</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 items-center mt-6 pt-6 border-t border-gray-100">
                                <p className="text-xs text-gray-400 w-full mb-2">Match Status</p>
                                <StatusBadge status="live" />
                                <StatusBadge status="upcoming" />
                                <StatusBadge status="completed" />
                                <StatusBadge status="postponed" />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Match Cards */}
                <section>
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400 mb-8">
                        Match Cards
                    </h2>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <MatchCard
                            homeTeam={homeTeam}
                            awayTeam={awayTeam}
                            homeScore={2}
                            awayScore={1}
                            status="live"
                            matchTime="67'"
                        />
                        <MatchCard
                            homeTeam={{ id: '3', name: 'Phoenix FC', shortName: 'PHX' }}
                            awayTeam={{ id: '4', name: 'Eagles', shortName: 'EGL' }}
                            status="upcoming"
                            matchTime="3:00 PM"
                            date="Today"
                            venue="Main Stadium"
                        />
                    </div>
                </section>

                {/* Stat Cards */}
                <section>
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400 mb-8">
                        Stat Cards
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Leagues"
                            value="4"
                            icon={<span className="text-lg">🏆</span>}
                        />
                        <StatCard
                            title="Teams"
                            value="24"
                            icon={<span className="text-lg">⚽</span>}
                            trend={{ value: 12, isPositive: true }}
                        />
                        <StatCard
                            title="Matches This Week"
                            value="8"
                            icon={<span className="text-lg">📅</span>}
                        />
                        <StatCard
                            title="Active Players"
                            value="156"
                            icon={<span className="text-lg">👥</span>}
                        />
                    </div>
                </section>

                {/* Team & Player Cards */}
                <section>
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400 mb-8">
                        Team & Player Cards
                    </h2>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <TeamCard
                            name="FC United"
                            league="Premier Division"
                            stats={{ wins: 8, draws: 2, losses: 1, points: 26 }}
                        />
                        <div className="space-y-4">
                            <PlayerCard
                                name="John Smith"
                                position="FWD"
                                number={9}
                                stats={{ goals: 12, assists: 5 }}
                            />
                            <PlayerCard
                                name="Mike Johnson"
                                position="MID"
                                number={8}
                                stats={{ goals: 4, assists: 10 }}
                            />
                        </div>
                    </div>
                </section>

                {/* Form Elements */}
                <section>
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400 mb-8">
                        Form Elements
                    </h2>
                    <Card>
                        <CardContent>
                            <p className="text-xs text-gray-400 mb-6">
                                Click inputs to see orange focus border
                            </p>
                            <div className="grid gap-6 md:grid-cols-2">
                                <Input label="Team Name" placeholder="Enter team name" />
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="you@example.com"
                                    error="Invalid email address"
                                />
                                <Select
                                    label="Position"
                                    placeholder="Select position"
                                    options={[
                                        { value: 'GK', label: 'Goalkeeper' },
                                        { value: 'DEF', label: 'Defender' },
                                        { value: 'MID', label: 'Midfielder' },
                                        { value: 'FWD', label: 'Forward' },
                                    ]}
                                />
                                <div className="flex items-center h-full pt-4">
                                    <Toggle
                                        checked={toggleValue}
                                        onChange={setToggleValue}
                                        label="Available for selection"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Modals */}
                <section>
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400 mb-8">
                        Modals
                    </h2>
                    <Card>
                        <CardContent>
                            <div className="flex gap-4">
                                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                                    Open Modal
                                </Button>
                                <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                                    Open Confirm
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Modals */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Create New Team"
                    description="Enter the details for the new team."
                >
                    <div className="space-y-4">
                        <Input label="Team Name" placeholder="Enter team name" />
                        <Input label="Stadium" placeholder="Enter stadium name" />
                        <div className="flex justify-end gap-3 mt-8">
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setIsModalOpen(false)}>Create Team</Button>
                        </div>
                    </div>
                </Modal>

                <ConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={() => setIsConfirmOpen(false)}
                    title="Delete Team?"
                    message="This action cannot be undone. All team data will be permanently deleted."
                    confirmLabel="Delete"
                    variant="danger"
                />
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8 mt-20">
                <div className="max-w-6xl mx-auto px-8 text-center">
                    <p className="text-[10px] text-gray-400 tracking-widest uppercase">
                        PLYAZ League Manager • Design System
                    </p>
                </div>
            </footer>
        </div>
    );
}
