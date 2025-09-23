
'use client';

import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react'; // Import icons for visual feedback

interface NotificationProps {
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
    onClose?: () => void; // REFINEMENT 1: Add an optional close handler
}

export function Notification({ show, type, message, onClose }: NotificationProps) {
    if (!show) return null;

    const typeStyles = {
        success: 'bg-primary/10 border-primary/20 text-primary',
        error: 'bg-destructive/10 border-destructive/20 text-destructive',
        info: 'bg-accent/50 border-accent text-accent-foreground',
    };

    const Icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    };

    return (
        // REFINEMENT 2: Added animations and a flex container for the icon and close button.
        <div
            className={cn(
                'p-4 rounded-lg border flex items-start justify-between gap-4 w-full animate-in fade-in-0 slide-in-from-top-4',
                typeStyles[type]
            )}
        >
            <div className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5">{Icons[type]}</span>
                <p className="text-sm font-medium">{message}</p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1 -m-1 rounded-full hover:bg-current/10 transition-colors"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
