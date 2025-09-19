// components/admin/client-management/SyncModal.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { syncAllUsersAppMetadata } from '@/app/actions/user-management-actions';

interface SyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSyncSuccess: () => void;
    showNotification: (type: 'success' | 'error', message: string) => void;
}

export function SyncModal({
                              isOpen,
                              onClose,
                              onSyncSuccess,
                              showNotification
                          }: SyncModalProps) {
    const [isSyncing, setIsSyncing] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsSyncing(true);
        const result = await syncAllUsersAppMetadata();
        if (result.success) {
            showNotification('success', result.message || 'Sync completed successfully.');
            onSyncSuccess();
        } else {
            showNotification('error', result.error || 'An unknown error occurred during sync.');
        }
        setIsSyncing(false);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center
            p-4 z-50 animate-in fade-in-0"
            onClick={onClose}
        >
            <Card
                className="max-w-md w-full animate-in zoom-in-95"
                 onClick={(e) => e.stopPropagation()}
            >
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <Shield className="w-5 h-5" />
                        Sync All User Roles
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <p className="text-primary text-sm">
                            <strong>What this does:</strong> This will update all user&apos;s app_metadata.role
                            to match their role in the profiles table. This ensures that Row Level Security
                            policies work correctly and users have the proper permissions.
                        </p>
                    </div>

                    <div className="bg-accent/50 border border-accent rounded-lg p-4">
                        <p className="text-accent-foreground text-sm">
                            <strong>Note:</strong> This operation will affect all users in the system.
                            Users may need to sign out and sign back in for changes to take full effect.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isSyncing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isSyncing}
                            className="flex-1"
                        >
                            {isSyncing ? (
                                <LoadingSpinner size="sm" text="Syncing..." />
                            ) : (
                                'Sync All Users'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
