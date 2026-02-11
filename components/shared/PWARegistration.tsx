'use client';

import { useEffect } from 'react';

/**
 * PWA Registration Component
 * Registers the service worker for offline support
 */
export const PWARegistration = () => {
    useEffect(() => {
        if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }, []);

    return null;
};

export default PWARegistration;
