// app/admin/downloads/page.tsx

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { BulkDownloadManager } from '@/components/admin/BulkDownloadManager';
import { Tooltip } from '@/components/ui/tooltip';
import { Download, Shield } from 'lucide-react';

export default async function AdminDownloadsPage() {
    const user = await getCurrentUser();

    if (!user || user.profile?.role !== 'admin') {
        redirect('/auth/admin/signin');
    }

    return (
        // THEME: Use theme variables for the background.
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        {/* THEME: Use theme colors for the header. */}
                        <Download className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">Download Manager</h2>
                        <Tooltip content="Download content in bulk by client, location, or date range">
                            <Shield className="w-5 h-5 text-muted-foreground" />
                        </Tooltip>
                    </div>
                    <p className="text-muted-foreground">
                        Download client content in bulk with advanced filtering options.
                    </p>
                </div>

                <BulkDownloadManager />
            </main>
        </div>
    );
}
