'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

/**
 * Modal Component - PLYAZ Design System (Refined)
 * Premium styling with clean black/white design
 */

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showCloseButton = true,
}) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className={cn(
                        'relative bg-surface-main rounded-lg shadow-2xl w-full',
                        'transform transition-all duration-300',
                        'animate-in fade-in-0 zoom-in-95',
                        sizes[size]
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary-main/5 transition-colors group"
                            aria-label="Close modal"
                        >
                            <svg
                                className="w-4 h-4 text-secondary-main/30 group-hover:text-accent-main transition-colors"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}

                    {/* Header */}
                    {(title || description) && (
                        <div className="px-6 pt-6 pb-4">
                            {title && (
                                <h2 className="text-sm font-medium tracking-widest uppercase text-primary-main">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="text-sm text-secondary-main/30 mt-2">{description}</p>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-6 pb-6">{children}</div>
                </div>
            </div>
        </>
    );
};

/**
 * ConfirmModal - For destructive actions
 */

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary';
    isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    isLoading = false,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="text-center">
                {/* Icon */}
                <div
                    className={cn(
                        'mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-6',
                        variant === 'danger' ? 'bg-red-50' : 'bg-primary-main/5'
                    )}
                >
                    {variant === 'danger' ? (
                        <svg
                            className="w-5 h-5 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="w-5 h-5 text-primary-main"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    )}
                </div>

                {/* Text */}
                <h3 className="text-sm font-medium tracking-widest uppercase text-primary-main mb-2">
                    {title}
                </h3>
                <p className="text-sm text-secondary-main/30 mb-8">{message}</p>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        fullWidth
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export { Modal, ConfirmModal };
export type { ModalProps, ConfirmModalProps };
