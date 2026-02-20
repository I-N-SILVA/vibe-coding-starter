"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

function AcceptInvite() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [status, setStatus] = useState('Accepting invitation...');

    useEffect(() => {
        const token = searchParams.get('token');

        if (authLoading) {
            return; // Wait for auth state to be determined
        }

        if (!isAuthenticated) {
            router.push(`/login?invite_token=${token}`);
            return;
        }

        if (!token) {
            setStatus('No invitation token found.');
            return;
        }

        const accept = async () => {
            const response = await fetch('/api/league/invites/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (response.ok) {
                setStatus('Invitation accepted! Redirecting...');
                router.push('/league');
            } else {
                const { error } = await response.json();
                setStatus(`Error: ${error}`);
            }
        };

        accept();
    }, [searchParams, router, isAuthenticated, authLoading]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>{status}</p>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AcceptInvite />
        </Suspense>
    );
}
