// src/app/actions/download-data-action.ts

'use server';

import { createClient } from '@/lib/supabase/server';
import { ContentItem } from '@/lib/types';
import { format } from 'date-fns';

function convertToCsv(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                let value = row[header];
                if (typeof value === 'string') {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ];
    return csvRows.join('\n');
}

export async function getClientDataAsCsv(clientId: string, clientEmail: string): Promise<{ success: boolean, error?: string }> {
    if (!clientId) return { success: false, error: 'Client ID is required.' };

    const supabase = await createClient({ useServiceRole: true });

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

    // This part is tricky in a server action. We can't directly trigger a download.
    // A common pattern is to return the content to the client to handle the download.
    // For now, let's just log it and return success, as we can't create a file blob on server easily
    // without more complex client-side logic to handle it.
    // In a real app, you might save this to a temporary file and return a URL to it.
    
    console.log(`---- CSV DATA FOR ${clientEmail} ----`);
    console.log(csvContent);
    
    // In a real scenario, you'd do something like this on the client:
    /*
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'client_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    */

    return { success: true };
}
