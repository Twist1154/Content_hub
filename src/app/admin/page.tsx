
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminClientOverview } from '@/components/admin/AdminClientOverview';

export default async function AdminDashboardPage() {
    const user = await getCurrentUser();

    // Ensure user is authenticated and is an admin
    if (!user || user.profile?.role !== 'admin') {
        redirect('/auth/admin/signin');
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                <AdminClientOverview />
            </main>
        </div>
    );
}
