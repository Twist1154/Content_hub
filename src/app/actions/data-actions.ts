

'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { ContentItem, ContentType } from '@/lib/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { startOfMonth, endOfMonth } from 'date-fns';

const storeSchema = z.object({
  name: z.string().min(1, 'Store name is required.'),
  brand_company: z.string().min(1, 'Brand/Company is required.'),
  address: z.string().min(1, 'Address is required.'),
});

export type StoreData = z.infer<typeof storeSchema>;

export async function addStore(storeData: StoreData, userId: string) {
  const supabase = await createClient() as SupabaseClient;

  const validatedFields = storeSchema.safeParse(storeData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid store data.',
    };
  }

  const { name, brand_company, address } = validatedFields.data;

  const { data, error } = await supabase
    .from('stores')
    .insert([{
      user_id: userId,
      name,
      brand_company,
      address,
    }])
    .select();

  if (error) {
    console.error('Error adding store:', error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: data[0],
  };
}

function getContentType(mimeType: string): ContentType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('application/pdf') || mimeType.startsWith('application/msword')) return 'document';
    return 'other';
}

function determineStatus(startDate: string | null, endDate: string | null): ContentItem['status'] {
    if (!startDate || !endDate) {
        return 'draft';
    }
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'draft';
    }

    if (end < now) {
        return 'archived';
    }
    if (start > now) {
        return 'scheduled';
    }
    return 'active';
}

export async function fetchAllContent(): Promise<{ success: boolean; content?: ContentItem[]; error?: string }> {
  try {
    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

    const { data: contentData, error: contentError } = await supabase
      .from('content')
      .select(`
          *,
          stores ( name, brand_company, address ),
          profiles ( email )
      `)
      .order('created_at', { ascending: false });

    if (contentError) {
      throw new Error(contentError.message);
    }
    
    if (!contentData) {
      return { success: true, content: [] };
    }

    const contentItems: ContentItem[] = contentData.map((item: any) => ({
        id: item.id,
        title: item.title,
        file_url: item.file_url,
        type: item.type,
        file_size: item.file_size,
        created_at: item.created_at,
        status: determineStatus(item.start_date, item.end_date),
        user_id: item.user_id,
        // @ts-ignore
        user_email: item.profiles?.email || 'Unknown',
        stores: item.stores,
        campaigns: null, // Placeholder
    }));

    return { success: true, content: contentItems };
  } catch (err: any) {
    console.error('Error fetching all content:', err);
    return { success: false, error: 'Failed to fetch all content.' };
  }
}

export async function fetchStoresByUserId(userId: string) {
    if (!userId) return { success: false, error: 'User ID is required.' };
    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId);
    
    if (error) {
        console.error("Error fetching stores:", error.message);
        return { success: false, error: error.message };
    }

    return { success: true, stores: data };
}

export async function fetchContentStatsByUserId(userId: string) {
    if (!userId) return { success: false, error: 'User ID is required.' };
    
    try {
        const supabase = await createClient({ useServiceRole: true}) as SupabaseClient;
        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const endOfCurrentMonth = endOfMonth(now);

        // Fetch all content for the user once
        const { data: allContent, error: fetchError } = await supabase
            .from('content')
            .select('start_date, end_date, created_at')
            .eq('user_id', userId);

        if (fetchError) throw fetchError;
        
        if (!allContent) {
            return { success: true, stats: { total: 0, active: 0, scheduled: 0, thisMonth: 0 } };
        }

        let activeCount = 0;
        let scheduledCount = 0;
        let thisMonthCount = 0;

        for (const item of allContent) {
            const status = determineStatus(item.start_date, item.end_date);
            if (status === 'active') activeCount++;
            if (status === 'scheduled') scheduledCount++;
            
            const createdAt = new Date(item.created_at);
            if (createdAt >= startOfCurrentMonth && createdAt <= endOfCurrentMonth) {
                thisMonthCount++;
            }
        }

        const stats = {
            total: allContent.length,
            active: activeCount,
            scheduled: scheduledCount,
            thisMonth: thisMonthCount,
        };

        return { success: true, stats };
    } catch (err: any) {
        console.error("Error fetching content stats:", err.message);
        return { 
            success: false, 
            error: err.message, 
            stats: { total: 0, active: 0, scheduled: 0, thisMonth: 0 } 
        };
    }
}

export async function fetchClientProfileById(clientId: string) {
    if (!clientId) return { success: false, error: 'Client ID is required' };
    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .eq('role', 'client')
        .single();
    
    if (error) {
        console.error(`Error fetching client profile for ${clientId}:`, error.message);
        return { success: false, error: error.message };
    }
    
    return { success: true, profile };
}

const contentSchema = z.object({
  store_id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  type: z.enum(['image', 'video', 'audio', 'document', 'other']),
  file_url: z.string().url(),
  file_size: z.number(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  recurrence_type: z.enum(['none', 'daily', 'weekly', 'monthly', 'custom']),
  recurrence_days: z.array(z.string()).nullable(),
});

export type ContentData = z.infer<typeof contentSchema>;

export async function insertContent(contentData: ContentData) {
    const supabase = await createClient({ useServiceRole: true });

    const validatedFields = contentSchema.safeParse(contentData);

    if (!validatedFields.success) {
        return {
            success: false,
            error: 'Invalid content data: ' + validatedFields.error.message,
        };
    }

    const { error } = await supabase
        .from('content')
        .insert([validatedFields.data]);
    
    if (error) {
        console.error('Error inserting content:', error);
        return {
            success: false,
            error: error.message,
        };
    }

    return { success: true };
}

export async function getAllAdmins() {
    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'admin');

    if (error) {
        console.error('Error fetching admins:', error);
        return { success: false, error: error.message, admins: [] };
    }
    return { success: true, admins: data };
}

export async function deleteContent(contentId: string, fileUrl: string) {
    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;
    // 1. Delete the file from storage
    const filePath = new URL(fileUrl).pathname.split('/files/').pop();
    if (filePath) {
        const { error: storageError } = await supabase.storage.from('files').remove([`public/${filePath}`]);
        if (storageError) {
            console.error('Error deleting file from storage:', storageError);
            // Decide if you want to stop or just log the error and continue
            // return { success: false, error: 'Failed to delete file from storage.' };
        }
    }

    // 2. Delete the record from the database
    const { error: dbError } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);
    
    if (dbError) {
        console.error('Error deleting content from database:', dbError);
        return { success: false, error: 'Failed to delete content from database.' };
    }

    return { success: true };
}


export async function fetchUserRole(userId: string) {
    if (!userId) return { success: false, error: 'User ID is required.' };
    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error(`Error fetching role for user ${userId}:`, error.message);
        return { success: false, error: error.message };
    }
    
    return { success: true, role: data.role };
}


export async function fetchContentForUser(
    userId: string,
    options: { useServiceRole?: boolean } = {}
): Promise<{ success: boolean; content?: ContentItem[]; error?: string }> {
    if (!userId) {
        return { success: false, error: 'User ID is required.' };
    }
    try {
        const supabase = await createClient({ useServiceRole: options.useServiceRole });

        const { data: content, error } = await supabase
            .from('content')
            .select(`
                *,
                stores (
                    name,
                    brand_company,
                    address
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }
        
        if (!content) {
            return { success: true, content: [] };
        }


        // The 'content' table doesn't have user_email directly.
        // If we needed it, we'd have to fetch it separately from 'profiles'.
        // For now, we'll omit it from the response for this specific query.
        const mappedContent: ContentItem[] = content.map((item: any) => ({
            id: item.id,
            title: item.title,
            file_url: item.file_url,
            type: item.type,
            file_size: item.file_size,
            created_at: item.created_at,
            status: determineStatus(item.start_date, item.end_date),
            user_id: item.user_id,
            stores: item.stores,
            campaigns: null, // Placeholder
        }));

        return { success: true, content: mappedContent };
    } catch (err: any) {
        console.error('Error fetching content for user:', err);
        return { success: false, error: 'Failed to fetch content.' };
    }
}
