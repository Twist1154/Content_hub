
'use server';

import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { subDays } from 'date-fns';

export interface ClientOverview {
    id: string;
    email: string;
    created_at: string;
    stores: { id: string; name: string }[];
    content_count: number;
    active_campaigns: number; // This will be a placeholder for now
    latest_upload: string | null;
}

export interface OverviewStats {
    totalClients: number;
    activeClients: number; // Active in the last 7 days
    totalUploads: number;
    recentActivity: number; // Uploads in the last 7 days
}

export async function getClientOverview(): Promise<{
    success: boolean;
    clients: ClientOverview[];
    stats: OverviewStats;
    error?: string;
}> {
    try {
        const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;
        const sevenDaysAgo = subDays(new Date(), 7).toISOString();

        // 1. Fetch all client profiles with their stores
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select(`
                id,
                email,
                created_at,
                stores ( id, name )
            `)
            .eq('role', 'client')
            .order('created_at', { ascending: false });

        if (profileError) {
            throw new Error(`Failed to fetch client profiles: ${profileError.message}`);
        }
        
        const userIds = profiles.map(p => p.id);

        // 2. Fetch all content in one query
        const { data: allContent, error: contentError } = await supabase
            .from('content')
            .select('user_id, created_at')
            .in('user_id', userIds);
        
        if (contentError) {
            throw new Error(`Failed to fetch content: ${contentError.message}`);
        }
        
        // 3. Process data in memory
        const contentByUser = new Map<string, { count: number; latest: string | null; recentCount: number }>();

        for (const contentItem of allContent) {
            if (!contentByUser.has(contentItem.user_id)) {
                contentByUser.set(contentItem.user_id, { count: 0, latest: null, recentCount: 0 });
            }
            const userContent = contentByUser.get(contentItem.user_id)!;
            userContent.count++;
            
            if (contentItem.created_at > (userContent.latest || '')) {
                userContent.latest = contentItem.created_at;
            }
            if (contentItem.created_at >= sevenDaysAgo) {
                userContent.recentCount++;
            }
        }
        
        let activeClients = 0;
        for (const userContent of contentByUser.values()){
            if (userContent.latest && userContent.latest >= sevenDaysAgo){
                activeClients++;
            }
        }

        const clients: ClientOverview[] = profiles.map(profile => ({
            id: profile.id,
            email: profile.email,
            created_at: profile.created_at,
            stores: profile.stores,
            content_count: contentByUser.get(profile.id)?.count || 0,
            latest_upload: contentByUser.get(profile.id)?.latest || null,
            active_campaigns: 0, // Placeholder
        }));

        const stats: OverviewStats = {
            totalClients: profiles.length,
            activeClients: activeClients,
            totalUploads: allContent.length,
            recentActivity: allContent.filter(c => c.created_at >= sevenDaysAgo).length,
        };

        return {
            success: true,
            clients: clients.slice(0, 5), // Return only the 5 most recent clients for the overview
            stats,
        };

    } catch (err: any) {
        console.error('Error in getClientOverview:', err);
        return {
            success: false,
            clients: [],
            stats: { totalClients: 0, activeClients: 0, totalUploads: 0, recentActivity: 0 },
            error: err.message || 'An unexpected error occurred.',
        };
    }
}
