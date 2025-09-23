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
import {getClientDataAsCsv} from '@/app/actions/download-data-action';

export function AdminClientManagement() {
    // --- STATE MANAGEMENT ---
    // Data and loading state
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

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
    const [notification, setNotification] = useState({
        show: false,
        type: 'info',
        message: ''
    });

    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        setNotification({show: true, type, message});
        setTimeout(() =>
                setNotification(prev => ({...prev, show: false}))
            , 5000);
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
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- HANDLERS ---
    const handleDownloadData = async (userId: string, userEmail: string) => {
        const result = await getClientDataAsCsv(userId, userEmail);
        if (result.success && result.csvString) {
            const blob = new Blob([result.csvString], {type: 'text/csv'});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.fileName || 'user-data.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } else {
            showNotification('error', result.error || 'Failed to download user data');
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
            <Notification
                show={notification.show}
                type={notification.type as 'success' | 'error' | 'info'}
                message={notification.message}
                onClose={() => setNotification(prev => ({...prev, show: false}))}
            />

            <ClientList
                users={filteredUsers}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onInviteClick={() => setInviteModalOpen(true)}
                onSyncClick={() => setSyncModalOpen(true)}
                onUserSelect={setManagingUser}
                onDownloadData={handleDownloadData}
            />

            {/* --- MODALS --- */}
            {/* Each modal now controls its own state and logic. The parent just toggles visibility */}
            {/* and provides callbacks for when actions are completed successfully. */}

            {managingUser && (
                <ClientManagementModal
                    user={managingUser}
                    onClose={() => setManagingUser(null)}
                    onUpdate={fetchUsers} // Tell the modal to call this to refresh the user list
                    onDeleteRequest={handleDeleteRequest} // A special handler to open the delete modal
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