// components/admin/AdminClientManagement.tsx

'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {LoadingSpinner} from '@/components/ui/loading-spinner';
import {ClientList} from '@/components/admin/client-management/ClientList';
import {ClientManagementModal} from '@/components/admin/client-management/ClientManagementModal';
import {InviteModal} from '@/components/admin/client-management/InviteModal';
import {DeleteConfirmationModal} from '@/components/admin/client-management/DeleteConfirmationModal';
import {SyncModal} from '@/components/admin/client-management/SyncModal';
import {Notification} from '@/components/ui/Notification';
import type {Client} from '@/app/actions/get-clients-action';
import {getAllClients} from '@/app/actions/get-clients-action';
import {getClientDataAsCsv} from '@/app/actions/download-data-action';

export function AdminClientManagement() {
    // --- STATE MANAGEMENT ---
    // Data and loading state
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    // Search and filtering
    const [searchTerm, setSearchTerm] = useState('');
    const filteredClients = useMemo(() => {
        if (!searchTerm) {
            return clients;
        }
        return clients.filter(client =>
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.stores?.some(store =>
                store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.brand_company.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [clients, searchTerm]);

    // Modal visibility and data
    const [managingClient, setManagingClient] = useState<Client | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
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
    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getAllClients();
            if (result.success) {
                setClients(result.clients);
            } else {
                showNotification('error', result.error || 'Failed to fetch clients');
            }
        } catch (error) {
            showNotification('error', 'An unexpected error occurred while fetching clients');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    // --- HANDLERS ---
    const handleDownloadData = async (clientId: string, clientEmail: string) => {
        const result = await getClientDataAsCsv(clientId, clientEmail);
        if (result.success && result.csvString) {
            const blob = new Blob([result.csvString], {type: 'text/csv'});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.fileName || 'client-data.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } else {
            showNotification('error', result.error || 'Failed to download client data');
        }
    };

    // This handler is passed to the manage modal, which calls it when a user needs to be deleted
    const handleDeleteRequest = (client: Client) => {
        setManagingClient(null); // Close the management modal
        setClientToDelete(client); // Open the delete confirmation modal
    };

    // --- RENDER LOGIC ---
    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <LoadingSpinner text="Loading clients..."/>
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
                clients={filteredClients}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onInviteClick={() => setInviteModalOpen(true)}
                onSyncClick={() => setSyncModalOpen(true)}
                onClientSelect={setManagingClient}
                onDownloadData={handleDownloadData}
            />

            {/* --- MODALS --- */}
            {/* Each modal now controls its own state and logic. The parent just toggles visibility */}
            {/* and provides callbacks for when actions are completed successfully. */}

            {managingClient && (
                <ClientManagementModal
                    client={managingClient}
                    onClose={() => setManagingClient(null)}
                    onUpdate={fetchClients} // Tell the modal to call this to refresh the client list
                    onDeleteRequest={handleDeleteRequest} // A special handler to open the delete modal
                    showNotification={showNotification}
                />
            )}

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onInviteSuccess={fetchClients}
                showNotification={showNotification}
            />

            <DeleteConfirmationModal
                isOpen={!!clientToDelete}
                client={clientToDelete}
                onClose={() => setClientToDelete(null)}
                onDeleteSuccess={fetchClients}
                showNotification={showNotification}
            />

            <SyncModal
                isOpen={isSyncModalOpen}
                onClose={() => setSyncModalOpen(false)}
                onSyncSuccess={fetchClients}
                showNotification={showNotification}
            />
        </div>
    );
}
