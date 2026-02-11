'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './Card';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <Card padding="lg" elevated>
                <CardContent className="py-16 text-center">
                    {icon && (
                        <div className="mx-auto w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-6">
                            <div className="w-6 h-6">{icon}</div>
                        </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto">{description}</p>
                    )}
                    {action && (
                        <Button variant="primary" onClick={action.onClick}>
                            {action.label}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default EmptyState;
