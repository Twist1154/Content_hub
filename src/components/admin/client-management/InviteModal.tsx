// components/admin/client-management/InviteModal.tsx

'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/Button';
import {Input} from '@/components/ui/Input';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {UserPlus} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import { inviteUser } from '@/app/actions/user-management-actions';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInviteSuccess: () => void;
    showNotification: (type: 'success' | 'error', message: string) => void;
}

export function InviteModal({
                                isOpen,
                                onClose,
                                onInviteSuccess,
                                showNotification
                            }: InviteModalProps) {
    const [inviteEmail, setInviteEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!inviteEmail) return;
        setIsSubmitting(true);
        const result = await inviteUser(inviteEmail, 'client');
        if (result.success) {
            showNotification('success', result.message || 'Invitation sent successfully.');
            onInviteSuccess();
            setInviteEmail('');
            onClose();
        } else {
            showNotification('error', result.error || 'Failed to send invitation.');
        }
        setIsSubmitting(false);
    };

    const handleClose = () => {
        setInviteEmail('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center
        justify-center p-4 z-50 animate-in fade-in-0" onClick={handleClose}>
            <Card className="max-w-md w-full animate-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5"/>
                        Invite New Client
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Email Address</label>
                        <Input
                            type="email"
                            placeholder="Enter email address"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!inviteEmail || isSubmitting}
                            className="flex-1">
                            {isSubmitting ? <LoadingSpinner size="sm"/> : 'Send Invitation'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
