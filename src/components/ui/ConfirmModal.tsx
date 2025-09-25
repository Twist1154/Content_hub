
// components/ui/ConfirmModal.tsx

'use client';

import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    confirmVariant?: 'default' | 'destructive';
    Icon?: React.ElementType;
}

export function ConfirmModal({
                                 isOpen,
                                 onClose,
                                 onConfirm,
                                 title,
                                 description,
                                 confirmText = "Confirm",
                                 confirmVariant = 'destructive',
                                 Icon = LogOut,
                             }: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        // NEW: 1. Add an onClick handler to the backdrop to close the modal.
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0"
            onClick={onClose}
        >
            {/* NEW: 2. Add an onClick handler here with `e.stopPropagation()`
                This prevents a click inside the modal from closing it. */}
            <div
                className="bg-card rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground mb-6">{description}</p>
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant={confirmVariant} onClick={onConfirm}>
                        <Icon className="w-4 h-4 mr-2" />
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
