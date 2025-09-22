// src/components/ui/Notification.tsx
'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const notificationVariants = {
  success: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-400 dark:border-green-600',
    iconColor: 'text-green-500 dark:text-green-400',
    textColor: 'text-green-800 dark:text-green-200',
    Icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-400 dark:border-red-600',
    iconColor: 'text-red-500 dark:text-red-400',
    textColor: 'text-red-800 dark:text-red-200',
    Icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-400 dark:border-blue-600',
    iconColor: 'text-blue-500 dark:text-blue-400',
    textColor: 'text-blue-800 dark:text-blue-200',
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
        'fixed top-5 right-5 w-full max-w-sm rounded-lg shadow-lg border-l-4 transition-transform transform z-50',
        variant.bg,
        variant.border,
        show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
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
              'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
              variant.textColor,
            )}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
