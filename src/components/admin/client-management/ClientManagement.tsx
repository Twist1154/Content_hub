// src/components/admin/client-management/ClientManagement.tsx
'use client';

import {useEffect, useMemo, useState} from 'react';
import type {Client} from '@/lib/types';
import {useToast} from '@/hooks/use-toast';
import {useRouter} from 'next/navigation';
import {getAllClients} from '@/lib/auth';
import {ClientList} from './ClientList';
import {ClientManagementModal} from './ClientManagementModal';
import {InviteModal} from './InviteModal';
import {DeleteConfirmationModal} from './DeleteConfirmationModal';
import {SyncModal} from './SyncModal';
import {getClientDataAsCsv} from '@/app/actions/download-data-action';

interface ClientManagementProps {
    initialClients: Client[];
}

export function ClientManagement({initialClients}: ClientManagementProps) {
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [deletingClient, setDeletingClient] = useState<Client | null>(null);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [isSyncModalOpen, setSyncModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const {toast} = useToast();
    const router = useRouter();

    const fetchClients = async () => {
        const {success, clients: newClients, error} = await getAllClients();
        if (success) {
            setClients(newClients);
        } else {
            toast({
                variant: 'destructive',
                title: 'Error refreshing clients',
                description: error,
            });
        }
    };

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const searchLower = searchTerm.toLowerCase();
            const matchesEmail = client.email.toLowerCase().includes(searchLower);
            const matchesStore = client.stores.some(store =>
                store.name.toLowerCase().includes(searchLower) ||
                store.brand_company.toLowerCase().includes(searchLower)
            );
            return matchesEmail || matchesStore;
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [clients, searchTerm]);


    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        toast({
            variant: type === 'error' ? 'destructive' : 'default',
            title: type.charAt(0).toUpperCase() + type.slice(1),
            description: message,
        });
    };

    const handleDownloadData = async (clientId: string, clientEmail: string) => {
        const result = await getClientDataAsCsv(clientId, clientEmail);
        if (!result.success) {
            showNotification('error', result.error || 'Failed to generate CSV.');
        }
    };

    const handleRefresh = () => {
        fetchClients();
        router.refresh();
    };

    return (
        <div>
            <ClientList
                clients={filteredClients}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onInviteClick={() => setInviteModalOpen(true)}
                onSyncClick={() => setSyncModalOpen(true)}
                onClientSelect={setSelectedClient}
                onDownloadData={handleDownloadData}
            />

            <ClientManagementModal
                client={selectedClient}
                onClose={() => setSelectedClient(null)}
                onUpdate={handleRefresh}
                onDeleteRequest={(client) => {
                    setSelectedClient(null);
                    setDeletingClient(client);
                }}
                showNotification={showNotification}
            />

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onInviteSuccess={handleRefresh}
                showNotification={showNotification}
            />

            <DeleteConfirmationModal
                client={deletingClient}
                isOpen={!!deletingClient}
                onClose={() => setDeletingClient(null)}
                onDeleteSuccess={handleRefresh}
                showNotification={showNotification}
            />

            <SyncModal
                isOpen={isSyncModalOpen}
                onClose={() => setSyncModalOpen(false)}
                onSyncSuccess={handleRefresh}
                showNotification={showNotification}
            />
        </div>
    );
}
