// src/app/actions/download-data-action.ts

'use server';

import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

function convertToCsv(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                let value = row[header];
                if (value === null || value === undefined) {
                    return '';
                }
                if (typeof value === 'string') {
                    // Escape quotes by doubling them and wrap the whole field in quotes if it contains a comma, newline, or quote.
                    if (value.includes('"') || value.includes(',') || value.includes('\n')) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                }
                return value;
            }).join(',')
        )
    ];
    return csvRows.join('\n');
}

export async function getClientDataAsCsv(clientId: string, clientEmail: string): Promise<{ success: boolean, csvString?: string, fileName?: string, error?: string }> {
    if (!clientId) return { success: false, error: 'Client ID is required.' };

    const supabase = createClient({ useServiceRole: true }) as SupabaseClient;

    const { data, error } = await supabase
        .from('content')
        .select(`
            *,
            stores ( name, brand_company, address )
        `)
        .eq('user_id', clientId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching data for client ${clientId}:`, error);
        return { success: false, error: 'Failed to fetch client data.' };
    }

    if (data.length === 0) {
        return { success: false, error: 'No content found for this client.' };
    }

    const flattenedData = data.map((item: any) => ({
        content_id: item.id,
        title: item.title,
        type: item.type,
        file_url: item.file_url,
        file_size_bytes: item.file_size,
        created_at: format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss'),
        start_date: item.start_date ? format(new Date(item.start_date), 'yyyy-MM-dd') : '',
        end_date: item.end_date ? format(new Date(item.end_date), 'yyyy-MM-dd') : '',
        recurrence_type: item.recurrence_type,
        recurrence_days: item.recurrence_days?.join(';'),
        store_name: item.stores?.name,
        store_brand: item.stores?.brand_company,
        store_address: item.stores?.address,
    }));

    const csvContent = convertToCsv(flattenedData);
    const fileName = `hapohub-data-${clientEmail.split('@')[0]}-${new Date().toISOString().split('T')[0]}.csv`;

    return { success: true, csvString: csvContent, fileName };
}
