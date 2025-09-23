// app/admin/clients/page.tsx

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminClientManagement } from '@/components/admin/AdminClientManagement';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Tooltip } from '@/components/ui/tooltip';
import { Users, Shield } from 'lucide-react';

export default async function AdminClientsPage() {
    const user = await getCurrentUser();

    if (!user || user.profile?.role !== 'admin') {
        redirect('/auth/admin/signin');
    }

    return (
        // THEME: Use theme variables for the background.
        <div className="min-h-screen bg-background">
            <AdminHeader
                user={user}
                title="Client Management"
                breadcrumbItems={[
                                        { label: 'Admin Dashboard', href: '/admin' },
                                        { label: 'Client Management', current: true }
                                    ]}
                                />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        {/* THEME: Use theme colors for the header icon and text. */}
                        <Users className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">All Clients</h2>
                        <Tooltip content="Manage all client accounts and access their dashboards">
                            <Shield className="w-5 h-5 text-muted-foreground" />
                        </Tooltip>
                    </div>
                    {/* THEME: Use theme color for the descriptive text. */}
                    <p className="text-muted-foreground">
                        View, manage, and access all client accounts and their content.
                    </p>
                </div>

                <AdminClientManagement />
            </main>
        </div>
    );
}
