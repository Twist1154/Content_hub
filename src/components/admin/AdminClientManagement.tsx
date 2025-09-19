// src/components/admin/AdminClientManagement.tsx
import { getAllClients } from '@/lib/auth';
import { ClientManagement } from '@/components/admin/client-management/ClientManagement';

export async function AdminClientManagement() {
    const { success, clients, error } = await getAllClients();

    if (!success) {
        return <div className="text-destructive p-4">Error fetching clients: {error}</div>;
    }

    return <ClientManagement initialClients={clients} />;
}
