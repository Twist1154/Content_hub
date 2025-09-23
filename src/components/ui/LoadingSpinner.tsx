'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <div className={cn('flex items-center justify-center', className)}>
            {/* THEME: Replaced hardcoded 'text-blue-600' with 'text-primary' to use the theme's main color. */}
            <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />

            {/* THEME: Replaced hardcoded 'text-gray-600' with 'text-muted-foreground' for theme-aware secondary text. */}
            {text && <span className="ml-2 text-muted-foreground">{text}</span>}
        </div>
    );
}
