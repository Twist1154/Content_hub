
// app/admin/page.tsx 

import {redirect} from 'next/navigation';
import {getCurrentUser} from '@/lib/auth';
import {AdminClientOverview} from '@/components/admin/AdminClientOverview';
import {Tooltip} from '@/components/ui/Tooltip';
import {Database, Download, Shield, Users} from 'lucide-react';
import Link from 'next/link';
// REFACTOR: Import the new ContentManager and its data fetching action
import {ContentManager} from '@/components/content/ContentManager';
import {fetchAllContent} from '@/app/actions/data-actions';

// This is a custom component we'll create for the dashboard links to avoid repeating styles.
const DashboardLinkCard = ({href, icon: Icon, title, description, iconColorClass}: {href: string; icon: React.ElementType; title: string; description: string; iconColorClass?: string;}) => (
    <Link href={href}>
        <div
            className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
                <Icon className={`w-8 h-8 ${iconColorClass}`}/>
                <div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    </Link>
);


export default async function AdminDashboard() {
    const user = await getCurrentUser();

    if (!user || user.profile?.role !== 'admin') {
        redirect('/auth/admin/signin');
    }

    return (
        // THEME: Use theme variables for the background.
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                {/* THEME: Themed the link cards and extracted them to a small sub-component for cleanliness. */}
                <div className="grid lg:grid-cols-4 gap-6 mb-8">
                    <DashboardLinkCard
                        href="/admin/clients"
                        icon={Users}
                        title="Client Management"
                        description="Manage all client accounts"
                        iconColorClass="text-primary"
                    />
                    <DashboardLinkCard
                        href="/admin/content"
                        icon={Database}
                        title="Content Library"
                        description="View all uploaded content"
                        iconColorClass="text-chart-2" 
                    />
                    <DashboardLinkCard
                        href="/admin/downloads"
                        icon={Download}
                        title="Bulk Downloads"
                        description="Download content in bulk"
                        iconColorClass="text-chart-4"
                    />
                    <DashboardLinkCard
                        href="/dashboard"
                        icon={Shield}
                        title="Client View"
                        description="Access client dashboard"
                        iconColorClass="text-chart-5"
                    />
                </div>

                {/* Quick Client Management Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        {/* THEME: Themed the section headers */}
                        <h2 className="text-xl font-semibold text-foreground">Client Overview</h2>
                        <Tooltip content="Quick overview of all client accounts">
                            <Users className="w-5 h-5 text-muted-foreground"/>
                        </Tooltip>
                    </div>
                    <p className="text-muted-foreground mb-6">
                        Quick access to client accounts, their dashboard views, and recent activity.
                    </p>
                    <AdminClientOverview/>
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold text-foreground">Recent Content Activity</h2>
                        <Tooltip content="View and organize all client-submitted content">
                            <Shield className="w-5 h-5 text-muted-foreground"/>
                        </Tooltip>
                    </div>
                    <p className="text-muted-foreground">
                        Quick overview of recent client uploads and activity.
                    </p>
                </div>

                {/* REFACTOR: Replace ContentViewer with ContentManager */}
                <ContentManager
                    fetchAction={fetchAllContent}
                    showGrouping={true} // You could set this to false for a simpler view on the dashboard
                    defaultView="grid"   // Default to a simple grid view here
                    isAdminView={true}
                />
            </main>
        </div>
    );
}
