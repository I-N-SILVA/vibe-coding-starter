'use client';

import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import { cn } from '@/lib/utils';

export interface AnimatedCounterProps extends React.HTMLAttributes<HTMLSpanElement> {
    value: number;
    duration?: number;
    delay?: number;
    easing?: string;
    formatValue?: (val: number) => string;
}

export function AnimatedCounter({
    value,
    duration = 2000,
    delay = 0,
    easing = 'easeOutExpo',
    formatValue = (val: number) => Math.round(val).toString(),
    className,
    ...props
}: AnimatedCounterProps) {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const prevValue = useRef(0);

    useEffect(() => {
        if (!nodeRef.current) return;

        const obj = { val: prevValue.current };

        anime({
            targets: obj,
            val: value,
            round: 1,
            duration,
            delay,
            easing,
            update: () => {
                if (nodeRef.current) {
                    nodeRef.current.innerHTML = formatValue(obj.val).toString();
                }
            },
            complete: () => {
                prevValue.current = value;
            }
        });
    }, [value, duration, delay, easing, formatValue]);

    return (
        <span ref={nodeRef} className={cn("inline-block", className)} {...props}>
            {formatValue(prevValue.current)}
        </span>
    );
}
