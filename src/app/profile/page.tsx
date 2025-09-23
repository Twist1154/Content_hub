
'use client';

import {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { FormField } from '@/components/ui/FormField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/ui/Toast';
import { deleteUser, sendPasswordReset } from '@/app/actions/user-management-actions';

export default function ProfilePage() {
    const { user, loading } = useUser();
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const router = useRouter();
    const { addToast } = useToast();

    useEffect(() => {
        if (!loading && !user) {
                router.push('/auth/client/signin');
            }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading Profile..." />
            </div>
        );
    }

    const handleChangePassword = async () => {
        if (!user.email) {
             addToast({ type: 'error', title: 'Error', message: 'User email not available.' });
             return;
        }
        const result = await sendPasswordReset(user.email);
        if (result.success) {
            addToast({ type: 'success', title: 'Password Reset Link Sent', message: 'Please check your email to continue.' });
        } else {
            addToast({ type: 'error', title: 'Error', message: result.error || 'Failed to send reset link.' });
        }
    };

    const handleDeleteAccount = async () => {
        const result = await deleteUser(user.id);
        if (result.success) {
            addToast({ type: 'success', title: 'Account Deleted', message: 'Your account is being deleted. You will be logged out.' });
            // The signout is handled by Supabase, the redirect will happen automatically
            // after the session is terminated by the middleware.
            router.push('/');
        } else {
             addToast({ type: 'error', title: 'Deletion Failed', message: result.error || 'Could not delete your account.' });
        }
        setDeleteModalOpen(false);
    };

    return (
        <>
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Email Address" icon={Mail}>
                                    <Input
                                        type="email"
                                        value={user.email || ''}
                                        disabled
                                        className="pl-10"
                                    />
                            </FormField>

                            <FormField label="Account Role" icon={Shield}>
                                    <Input
                                        value={user.profile?.role || 'client'}
                                        disabled
                                        className="pl-10 capitalize"
                                    />
                            </FormField>

                            <FormField label="Member Since" icon={Calendar}>
                                    <Input
                                        value={user.profile?.created_at ? format(new Date(user.profile.created_at), 'MMMM dd, yyyy') : 'Unknown'}
                                        disabled className="pl-10"
                                    />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleChangePassword}>
                                    Change Password
                                </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        disabled
                                    >
                                        Update Email (Coming Soon)
                                </Button>
                            </div>

                            <div className="pt-4 border-t border-border">
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={() => setDeleteModalOpen(true)}>
                                    Delete Account
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    This action cannot be undone. All your data will be permanently deleted.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account"
                description="Are you sure you want to permanently delete your account? This action cannot be undone."
                confirmText="Yes, Delete My Account"
                confirmVariant="destructive"
            />
        </>
    );
}
