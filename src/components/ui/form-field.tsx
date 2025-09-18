import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  error?: string;
}

export function FormField({ label, children, icon: Icon, className, error }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />}
        {children}
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
