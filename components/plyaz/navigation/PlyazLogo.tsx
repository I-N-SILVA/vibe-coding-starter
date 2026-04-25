import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PlyazLogoProps {
    className?: string;
}

export const PlyazLogo: React.FC<PlyazLogoProps> = ({ className }) => (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
        <div className="relative w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-primary/20 border border-transparent group-hover:border-primary/20">
            <Image
                src="/static/branding/logo-circle.png"
                alt="Plyaz Logo"
                fill
                className="object-contain p-1"
            />
            {/* Logo Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out] pointer-events-none" />
        </div>
        <div className="flex flex-col leading-none">
            <span className="text-[13px] font-black tracking-[0.3em] text-neutral-900 dark:text-white transition-colors duration-300 uppercase">
                PLYAZ
            </span>
            <span className="text-[7px] font-black tracking-[0.4em] text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                LEAGUE
            </span>
        </div>

        <style jsx global>{`
            @keyframes shine {
                100% {
                    transform: translateX(100%);
                }
            }
        `}</style>
    </div>
);

export default PlyazLogo;
