import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PlyazLogoProps {
    className?: string;
}

export const PlyazLogo: React.FC<PlyazLogoProps> = ({ className }) => (
    <div className={cn("flex items-center gap-2", className)}>
        <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Image
                src="/static/branding/logo-circle.png"
                alt="Plyaz Logo"
                fill
                className="object-contain"
            />
        </div>
        <span className="text-sm font-bold tracking-[0.2em] text-gray-900 group-hover:text-accent-main transition-colors duration-300 uppercase">
            PLYAZ
        </span>
    </div>
);

export default PlyazLogo;
