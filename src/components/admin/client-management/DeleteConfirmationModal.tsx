// components/admin/client-management/DeleteConfirmationModal.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { deleteUser } from '@/app/actions/user-management-actions';
import { User } from "@/app/actions/get-clients-action";

interface DeleteConfirmationModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onDeleteSuccess: () => void;
    showNotification: (type: 'success' | 'error', message: string) => void;
}

export function DeleteConfirmationModal({
    user,
    isOpen,
    onClose,
    onDeleteSuccess,
    showNotification
}: DeleteConfirmationModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !user) return null;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        const result = await deleteUser(user.id);
        if (result.success) {
            showNotification('success', 'User account has been deleted.');
            onDeleteSuccess();
        } else {
            showNotification('error', result.error || 'Failed to delete user account.');
        }
        onClose();
        setIsSubmitting(false);
    };

    return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0"
         onClick={onClose}>
            <Card className="max-w-md w-full animate-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Delete User Account
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <p className="text-destructive text-sm">
                            <strong>Warning:</strong> This will permanently delete the user account for
                            <strong> {user.email}</strong> and all associated data. This action cannot be undone.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                        variant="outline"
                        onClick={onClose}
                            className="flex-1"
                            disabled={isSubmitting}>
                        Cancel
                        </Button>
                        <Button
                        variant="destructive"
                            onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="flex-1">
                            {isSubmitting ? <LoadingSpinner size="sm" /> : 'Delete Account'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
    </div>
    );
}