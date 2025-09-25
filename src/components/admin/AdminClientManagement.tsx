// components/admin/AdminClientManagement.tsx

'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {ClientList} from '@/components/admin/client-management/ClientList';
import {ClientManagementModal} from '@/components/admin/client-management/ClientManagementModal';
import {InviteModal} from '@/components/admin/client-management/InviteModal';
import {DeleteConfirmationModal} from '@/components/admin/client-management/DeleteConfirmationModal';
import {SyncModal} from '@/components/admin/client-management/SyncModal';
import {Notification} from '@/components/ui/Notification';
import type {User} from '@/app/actions/get-clients-action';
import {getAllUsers} from '@/app/actions/get-clients-action';
import { fetchContentForUser } from '@/app/actions/data-actions';
import { useToast } from '@/components/ui/Toast';
import { format } from 'date-fns';

export function AdminClientManagement() {
    // --- STATE MANAGEMENT ---
    // Data and loading state
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    // Search and filtering
    const [searchTerm, setSearchTerm] = useState('');
    const filteredUsers = useMemo(() => {
        if (!searchTerm) {
            return users;
        }
        return users.filter(user =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.stores?.some(store =>
                store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.brand_company.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [users, searchTerm]);

    // Modal visibility and data
    const [managingUser, setManagingUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [isSyncModalOpen, setSyncModalOpen] = useState(false);

    // Notification state
    const { addToast } = useToast();
    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        addToast({ type: type, title: type.charAt(0).toUpperCase() + type.slice(1), message });
    };

    // --- DATA FETCHING ---
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getAllUsers();
            if (result.success) {
                setUsers(result.users);
            } else {
                showNotification('error', result.error || 'Failed to fetch users');
            }
        } catch (error) {
            showNotification('error', 'An unexpected error occurred while fetching users');
        }
        setLoading(false);
    }, [addToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- HANDLERS ---
    const handleDownloadData = async (userId: string, userEmail: string) => {
        setIsDownloading(true);
        showNotification('info', 'Preparing download...');

        try {
            const contentResult = await fetchContentForUser(userId, { useServiceRole: true });
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
            const safeEmail = userEmail.split('@')[0];
            a.download = `hapohub-data-${safeEmail}-${format(new Date(), 'yyyy-MM-dd')}.zip`;
            document.body.appendChild(a);
a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            showNotification('success', 'Your download has started.');

        } catch (error: any) {
            showNotification('error', error.message || 'Failed to prepare download.');
        } finally {
            setIsDownloading(false);
        }
    };

    // This handler is passed to the manage modal, which calls it when a user needs to be deleted
    const handleDeleteRequest = (user: User) => {
        setManagingUser(null); // Close the management modal
        setUserToDelete(user); // Open the delete confirmation modal
    };

    // --- RENDER LOGIC ---
    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <LoadingSpinner text="Loading users..."/>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ClientList
                users={filteredUsers}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onInviteClick={() => setInviteModalOpen(true)}
                onSyncClick={() => setSyncModalOpen(true)}
                onUserSelect={setManagingUser}
                onDownloadData={handleDownloadData}
                isDownloading={isDownloading}
            />

            {managingUser && (
                <ClientManagementModal
                    user={managingUser}
                    onClose={() => setManagingUser(null)}
                    onUpdate={fetchUsers}
                    onDeleteRequest={handleDeleteRequest}
                    showNotification={showNotification}
                />
            )}

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onInviteSuccess={fetchUsers}
                showNotification={showNotification}
            />

            <DeleteConfirmationModal
                isOpen={!!userToDelete}
                user={userToDelete}
                onClose={() => setUserToDelete(null)}
                onDeleteSuccess={fetchUsers}
                showNotification={showNotification}
            />

            <SyncModal
                isOpen={isSyncModalOpen}
                onClose={() => setSyncModalOpen(false)}
                onSyncSuccess={fetchUsers}
                showNotification={showNotification}
            />
        </div>
    );
}