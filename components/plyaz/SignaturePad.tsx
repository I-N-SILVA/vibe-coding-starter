'use client';

import React, { useRef, useEffect } from 'react';
import { Button } from './Button';

interface SignaturePadProps {
    onSave: (signature: string) => void;
    onClear?: () => void;
    label: string;
}

export function SignaturePad({ onSave, onClear, label }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const startDrawing = (e: MouseEvent | TouchEvent) => {
            isDrawing.current = true;
            draw(e);
        };

        const stopDrawing = () => {
            isDrawing.current = false;
            ctx.beginPath();
        };

        const draw = (e: MouseEvent | TouchEvent) => {
            if (!isDrawing.current) return;
            e.preventDefault();

            const rect = canvas.getBoundingClientRect();
            let x, y;

            if (e instanceof MouseEvent) {
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            } else {
                x = e.touches[0].clientX - rect.left;
                y = e.touches[0].clientY - rect.top;
            }

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.moveTo(x, y);
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);

        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, []);

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (onClear) onClear();
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        onSave(dataUrl);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">{label}</span>
                <button 
                    onClick={handleClear}
                    className="text-[10px] font-bold text-orange-500 uppercase hover:opacity-70"
                >
                    Clear
                </button>
            </div>
            <div className="border-2 border-slate-100 rounded-2xl bg-slate-50 overflow-hidden touch-none">
                <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={150} 
                    className="w-full h-[150px] cursor-crosshair"
                />
            </div>
            <Button size="sm" variant="outline" fullWidth onClick={handleSave}>
                Confirm Signature
            </Button>
        </div>
    );
}
