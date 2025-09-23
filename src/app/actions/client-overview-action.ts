
// app/actions/client-overview-action.ts

'use server';

import { createClient } from '@/utils/supabase/server';
import {SupabaseClient} from "@supabase/supabase-js";

// Interfaces remain the same, they are well-defined.
export interface ClientOverview {
    id: string;
    email: string;
    role: string;
    created_at: string;
    stores?: {
        id: string;
        name: string;
        brand_company: string;
    }[];
    content_count?: number;
    latest_upload?: string;
    active_campaigns?: number;
}

export interface OverviewStats {
    totalClients: number;
    activeClients: number;
    totalUploads: number;
    recentActivity: number;
}

export interface ClientOverviewResult {
    success: boolean;
    clients: ClientOverview[];
    stats: OverviewStats;
    error?: string;
}

export async function getClientOverview(): Promise<ClientOverviewResult> {
    console.log("--- [Action Triggered] getClientOverview ---");

    try {
        console.log("[getClientOverview] Creating Supabase client with service role. RLS will be bypassed.");
        const supabase = await createClient({ useServiceRole: true })as SupabaseClient;
        console.log('client-overview-action: Supabase client created');

        console.log("[getClientOverview] Fetching data from Supabase...");
        const [statsData, recentClientsData] = await Promise.all([
            supabase
                .from('profiles')
                .select('id, content(user_id, created_at, start_date, end_date)')
                .eq('role', 'client'),

            supabase
                .from('profiles')
                .select(`
                id, email, role, created_at,
                stores (id, name, brand_company)
                `)
                .eq('role', 'client')
                .order('created_at', { ascending: false }),
        ]);

        console.log("[getClientOverview] Data received from Supabase.");

        // --- LOG 3: Log potential errors from Supabase ---
        if (statsData.error) {
            console.error("[getClientOverview] ERROR from statsData query:", statsData.error);
            throw statsData.error; // This will be caught by the main catch block
        }
        if (recentClientsData.error) {
            console.error("[getClientOverview] ERROR from recentClientsData query:", recentClientsData.error);
            throw recentClientsData.error;
        }
        console.log("--- RAW DATA FROM SUPABASE (STATS) ---");
        console.log(JSON.stringify(statsData.data, null, 2)); // Pretty-print the JSON
        console.log("--- RAW DATA FROM SUPABASE (CLIENTS) ---");
        console.log(JSON.stringify(recentClientsData.data, null, 2)); // Pretty-print the JSON

        console.log(`[getClientOverview] Received ${statsData.data?.length ?? 0} profiles for stats processing.`);
        console.log(`[getClientOverview] Received ${recentClientsData.data?.length ?? 0} profiles for client list.`);

        if (statsData.data?.length === 0) {
            console.warn("[getClientOverview] WARNING: The query returned 0 client profiles. This could be because no clients exist or an unexpected issue.");
        }

        // --- Start processing the data... ---
        const allProfilesWithContent = statsData.data || [];
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        let totalUploads = 0;
        let recentActivity = 0;
        const activeClientIds = new Set<string>();

        allProfilesWithContent.forEach(profile => {
            if (Array.isArray(profile.content)) {
            totalUploads += profile.content.length;

            profile.content.forEach(c => {
                const createdAt = new Date(c.created_at);
                if (createdAt >= oneWeekAgo) {
                    recentActivity++;
                    activeClientIds.add(c.user_id);
        }
        });
            }
            });

        const stats: OverviewStats = {
            totalClients: allProfilesWithContent.length,
            activeClients: activeClientIds.size,
            totalUploads,
            recentActivity,
        };

        // --- Process Recent Clients List ---
        const recentProfiles = recentClientsData.data || [];
        const clients: ClientOverview[] = recentProfiles.map(profile => {
            // Find the content for this specific client from our stats data
            const profileContent =
                allProfilesWithContent.find(p => p.id === profile.id)?.content || [];

            let latestUploadDate: string | undefined = undefined;
            if (profileContent.length > 0) {
                latestUploadDate = profileContent.reduce((latest, current) =>
                    new Date(current.created_at) > new Date(latest.created_at)
                        ? current
                        : latest
                ).created_at;
                }

                const now = new Date();
            const activeCampaigns = profileContent.filter(item =>
                    item.start_date && item.end_date && new Date(item.start_date) <= now && new Date(item.end_date) >= now
                ).length;

                return {
                ...(profile as Omit<typeof profile, 'stores'>), // Cast to ensure type compatibility
                stores: profile.stores || [],
                content_count: profileContent.length,
                latest_upload: latestUploadDate,
                    active_campaigns: activeCampaigns,
                };
            });

        console.log(`[getClientOverview] Processing complete. Returning ${clients.length} clients and final stats.`);
        console.log("[getClientOverview] Final Stats:", stats);

        console.log("--- [Action Succeeded] getClientOverview ---");
        return {
            success: true,
            clients,
            stats,
        };

    } catch (error: any) {
        console.error("--- [Action Failed] An error occurred in getClientOverview ---");
        console.error("Error Message:", error.message);
        console.error("Full Error Object:", error);

        return {
            success: false,
            clients: [],
            stats: {
                totalClients: 0,
                activeClients: 0,
                totalUploads: 0,
                recentActivity: 0
            },
            error: error.message || 'An unexpected error occurred.',
        };
    }
}
