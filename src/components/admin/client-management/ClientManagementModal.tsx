// src/components/admin/client-management/ClientManagementModal.tsx
'use client';

import {useEffect, useState} from 'react';
import type {User} from '@/app/actions/get-clients-action';
import {format} from 'date-fns';
import Link from 'next/link';
import {Button} from '@/components/ui/Button';
import {Input} from '@/components/ui/Input';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {Download, Eye, Key, Mail, Settings, Shield, Trash2, X} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {
    changeUserEmail,
    sendPasswordReset,
} from '@/app/actions/user-management-actions';
import { switchUserRole } from '@/app/actions/auth-actions';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { fetchContentForUser } from '@/app/actions/data-actions';

interface ClientManagementModalProps {
    user: User | null,
    onClose: () => void,
    onUpdate: () => void,
    onDeleteRequest: (user: User) => void,
    showNotification: (type: 'success' | 'error' | 'info', message: string) => void,
}

export function ClientManagementModal({
    user,
    onClose,
    onUpdate,
    onDeleteRequest,
    showNotification
}: ClientManagementModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [newEmail, setNewEmail] = useState('');
    const [showRoleConfirm, setShowRoleConfirm] = useState(false);

    useEffect(() => {
        if (!user) setNewEmail('');
    }, [user]);

    if (!user) return null;

    const runAction = async (actionName: string, actionFn: Promise<any>) => {
        setIsSubmitting(true);
        setActiveAction(actionName);
        try {
            const result = await actionFn;
            if (result.success) {
                showNotification('success', result.message || 'Action completed successfully.');
                onUpdate(); // Refresh user list
                if (actionName === 'changeEmail') {
                    onClose();
                }
            } else {
                showNotification('error', result.error || 'An unknown error occurred.');
            }
        } catch (err: any) {
            showNotification('error', err.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
            setActiveAction(null);
        }
    };
    
    const handleConfirmSwitchRole = async () => {
        const newRole = user.role === 'admin' ? 'client' : 'admin';
        await runAction(
            'switchRole',
            switchUserRole(user.id, newRole)
        );
        setShowRoleConfirm(false);
    };

    const handleDownloadData = async () => {
        setIsSubmitting(true);
        setActiveAction('downloadData');
        showNotification('info', 'Preparing download...');

        try {
            const contentResult = await fetchContentForUser(user.id, { useServiceRole: true });
            if (!contentResult.success || !contentResult.content || contentResult.content.length === 0) {
                throw new Error('No content found for this client.');
            }

            const fileUrls = contentResult.content.map(item => item.file_url);

            const response = await fetch('/api/download-zip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileUrls }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to download files.' }));
                throw new Error(errorData.error);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeEmail = user.email.split('@')[0];
            a.download = `hapohub-data-${safeEmail}-${format(new Date(), 'yyyy-MM-dd')}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            showNotification('success', 'Your download has started.');

        } catch (error: any) {
            showNotification('error', error.message || 'Failed to prepare download.');
        } finally {
            setIsSubmitting(false);
            setActiveAction(null);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0"
            onClick={onClose}>
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5"/>
                            Manage User: {user.email}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onClose}><X className="h-4 w-4"/></Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-muted/50 rounded-lg border border-border">
                        <div><strong>Email:</strong> {user.email}</div>
                        <div><strong>Role:</strong> <span className="capitalize">{user.role}</span></div>
                        <div><strong>Joined:</strong> {format(new Date(user.created_at), 'MMM dd, yyyy HH:mm')}</div>
                        <div><strong>Total Uploads:</strong> {user.content_count || 0}</div>
                    </div>

                    <div className="border-t border-border pt-6">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary"/>
                            Admin Actions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-3">
                                <h5 className="font-medium text-foreground flex items-center gap-2">
                                    <Mail className="w-4 h-4"/>
                                    Change Email Address
                                </h5>
                                <div className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="New email address"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={() => runAction('changeEmail',
                                            changeUserEmail(user.id, newEmail))}
                                        disabled={!newEmail || isSubmitting}
                                        size="sm">
                                        {isSubmitting && activeAction === 'changeEmail'
                                            ? <LoadingSpinner size="sm"/> : 'Change'}
                                    </Button>
                                </div>
                            </div>
                             <div className="space-y-3">
                                <h5 className="font-medium text-foreground flex items-center gap-2">
                                    <Key className="w-4 h-4"/>
                                    Password Reset
                                </h5>
                                <Button
                                    onClick={() => runAction('passwordReset',
                                        sendPasswordReset(user.email))}
                                    disabled={isSubmitting}
                                    variant="outline"
                                    className="w-full">
                                    {isSubmitting && activeAction === 'passwordReset'
                                        ? <LoadingSpinner size="sm" text="Sending..."/> : 'Send Reset Link'}
                                </Button>
                            </div>
                            <div className="space-y-3">
                                <h5 className="font-medium text-foreground flex items-center gap-2">
                                    <Shield className="w-4 h-4"/>Role Management</h5>
                                <p className="text-sm text-muted-foreground">Current role: {user.role}. You can {user.role === 'admin' ? 'demote to client' : 'promote to admin'}.</p>
                                <Button
                                    onClick={() => setShowRoleConfirm(true)}
                                    disabled={isSubmitting}
                                    variant={user.role === 'admin' ? 'destructive' : 'default'}
                                    className="w-full">
                                    {isSubmitting && activeAction === 'switchRole' ? <LoadingSpinner size="sm"/> : (user.role === 'admin' ? 'Make Client' : 'Make Admin')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {user.stores && user.stores.length > 0 && (
                        <div className="border-t border-border pt-6">
                            <h4 className="font-medium text-foreground mb-2">Stores ({user.stores.length})</h4>
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                {user.stores.map(store => (
                                    <div key={store.id} className="p-3 bg-muted/50 rounded border border-border">
                                        <div className="font-medium text-foreground">{store.name}</div>
                                        <div className="text-sm text-muted-foreground">{store.brand_company}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-border">
                        {user.role === 'client' && (
                            <Link href={`/dashboard?admin_view=${user.id}`} className="flex-1">
                                <Button variant="default" className="w-full">
                                    <Eye className="w-4 h-4 mr-2"/>View Dashboard</Button>
                            </Link>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleDownloadData}
                            disabled={isSubmitting}>
                            {isSubmitting && activeAction === 'downloadData' ? <LoadingSpinner size='sm' text="Zipping..." /> : <><Download className="w-4 h-4 mr-2"/>Download Data</>}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => onDeleteRequest(user)}
                            disabled={isSubmitting}>
                            <Trash2 className="w-4 h-4 mr-2"/>Delete Account</Button>
                    </div>
                </CardContent>
            </Card>
            <ConfirmModal
                isOpen={showRoleConfirm}
                onClose={() => setShowRoleConfirm(false)}
                onConfirm={handleConfirmSwitchRole}
                title={user.role === 'admin' ? 'Demote to Client' : 'Promote to Admin'}
                description={`Are you sure you want to ${user.role === 'admin' ? 'demote' : 'promote'} ${user.email} ${user.role === 'admin' ? 'to client' : 'to admin'}?`}
                confirmText={user.role === 'admin' ? 'Make Client' : 'Make Admin'}
            />
        </div>
    );
}
