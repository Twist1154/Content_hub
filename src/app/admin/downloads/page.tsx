// src/app/admin/downloads/page.tsx

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Archive } from 'lucide-react';
import { BulkDownloadManager } from '@/components/admin/BulkDownloadManager';

export default async function AdminDownloadsPage() {
    const user = await getCurrentUser();

    if (!user || user.profile?.role !== 'admin') {
        redirect('/auth/admin/signin');
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Archive className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Bulk Content Download</h2>
                </div>
                <p className="text-muted-foreground">
                    Filter and download multiple content items as a single ZIP archive.
                </p>
            </div>

            <BulkDownloadManager />
        </main>
    );
}
