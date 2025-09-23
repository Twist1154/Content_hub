
'use client';

import { cn } from "@/lib/utils";
import React from "react";

interface FormFieldProps {
    label: string;
    icon?: React.ElementType;
    error?: string;
    children: React.ReactNode;
    className?: string;
}

export function FormField({ label, icon: Icon, error, children, className }: FormFieldProps) {
    return (
        <div className={cn("space-y-1", className)}>
            <label className="block text-sm font-medium text-muted-foreground">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                )}
                {children}
            </div>
            {error && <p className="text-destructive text-sm mt-1">{error}</p>}
        </div>
    );
}
