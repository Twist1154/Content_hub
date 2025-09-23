// app/admin/content/page.tsx

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Tooltip } from '@/components/ui/tooltip';
import { Database, Shield } from 'lucide-react';
import { ContentManager } from '@/components/content/ContentManager';
import { fetchAllContent } from '@/app/actions/data-actions';

export default async function AdminContentPage() {
    const user = await getCurrentUser();

    if (!user || user.profile?.role !== 'admin') {
        redirect('/auth/admin/signin');
    }

    // This check is important because getCurrentUser can return a user object
    // that is not null, but the profile property on it is.
    if (!user.profile) {
        // Handle case where profile is unexpectedly null for an admin
        redirect('/auth/admin/signin');
        return null;
    }
    
    return (
        // THEME: Use theme variables for the background.
        <div className="min-h-screen bg-background">
            <AdminHeader
                user={user}
                title="Content Library"
                breadcrumbItems={[
                                        { label: 'Admin Dashboard', href: '/admin' },
                                        { label: 'Content Library', current: true }
                                    ]}
                                />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        {/* THEME: Use theme colors */}
                        <Database className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">All Content</h2>
                        <Tooltip content="View and organize all client-submitted content">
                            <Shield className="w-5 h-5 text-muted-foreground" />
                        </Tooltip>
                    </div>
                    <p className="text-muted-foreground">
                        Complete library of all client-uploaded marketing content with advanced filtering and organization.
                    </p>
                </div>

                {/* REFACTOR: Replace ContentViewer with ContentManager */}
                <ContentManager
                    fetchAction={fetchAllContent}
                    showGrouping={true}
                    defaultView="company"
                    isAdminView={true} // Use the AdminContentCard
                />
            </main>
        </div>
    );
}
