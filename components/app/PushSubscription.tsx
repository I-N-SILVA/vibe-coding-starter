'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/plyaz';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

export const PushSubscription = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
    };

    const toggleSubscription = async () => {
        try {
            if (isSubscribed) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                await subscription?.unsubscribe();
                setIsSubscribed(false);
                toast.success('Unsubscribed from live updates');
            } else {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    toast.error('Permission denied for notifications');
                    return;
                }

                // In a real app, you would generate a VAPID public key and send the sub to your server
                // For this starter, we just toggle the UI state to demonstrate the feature
                setIsSubscribed(true);
                toast.success('Subscribed to live match updates!');
            }
        } catch (err) {
            console.error('Push error:', err);
            toast.error('Failed to toggle subscription');
        }
    };

    if (!isSupported) return null;

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleSubscription}
            className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase"
        >
            {isSubscribed ? (
                <>
                    <BellOff className="w-3.5 h-3.5" />
                    <span>Disable Alerts</span>
                </>
            ) : (
                <>
                    <Bell className="w-3.5 h-3.5 text-primary" />
                    <span>Get Live Alerts</span>
                </>
            )}
        </Button>
    );
};
