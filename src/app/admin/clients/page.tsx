// app/admin/clients/page.tsx

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminClientManagement } from '@/components/admin/AdminClientManagement';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Users } from 'lucide-react';

export default async function AdminClientsPage() {
    const user = await getCurrentUser();

    if (!user || user.profile?.role !== 'admin') {
        redirect('/auth/admin/signin');
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">All Clients</h2>
                    </div>
                    <p className="text-muted-foreground">
                        View, manage, invite, and access all client accounts and their content.
                    </p>
                </div>

                <AdminClientManagement />
            </main>
        </div>
    );
}
