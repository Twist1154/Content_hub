// src/components/ui/Notification.tsx
'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const notificationVariants = {
  success: {
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    iconColor: 'text-primary',
    textColor: 'text-primary',
    Icon: CheckCircle,
  },
  error: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    iconColor: 'text-destructive',
    textColor: 'text-destructive',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-accent/50',
    border: 'border-accent',
    iconColor: 'text-accent-foreground',
    textColor: 'text-accent-foreground',
    Icon: Info,
  },
};

interface NotificationProps {
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Notification({
  show,
  type,
  message,
  onClose,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const variant = notificationVariants[type];
  const Icon = variant.Icon;

  return (
    <div
      className={cn(
        'fixed top-5 right-5 w-full max-w-sm rounded-lg shadow-lg border-l-4 transition-all transform z-50',
        variant.bg,
        variant.border,
        show ? 'translate-x-0 opacity-100 animate-in fade-in-0 slide-in-from-top-4' : 'translate-x-full opacity-0'
      )}
      role="alert"
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0">
          <Icon className={cn('h-6 w-6', variant.iconColor)} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 pt-0.5">
          <p className={cn('text-sm font-medium', variant.textColor)}>{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className={cn(
              'inline-flex rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-current/10 transition-colors',
              variant.textColor
            )}
            aria-label="Close notification"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
