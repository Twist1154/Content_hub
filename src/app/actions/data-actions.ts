'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { ContentItem, ContentType } from '@/lib/types';

const storeSchema = z.object({
  name: z.string().min(1, 'Store name is required.'),
  brand_company: z.string().min(1, 'Brand/Company is required.'),
  address: z.string().min(1, 'Address is required.'),
});

export type StoreData = z.infer<typeof storeSchema>;

export async function addStore(storeData: StoreData, userId: string) {
  const supabase = await createClient();

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

export async function fetchAllContent(): Promise<ContentItem[]> {
  const supabase = await createClient({ useServiceRole: true });

  const { data: files, error: filesError } = await supabase
    .storage
    .from('files')
    .list('public', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (filesError) {
    console.error('Error fetching files from storage:', filesError);
    return [];
  }

  if (!files || files.length === 0) {
    return [];
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, stores(id, name, brand_company)');
  
  if (profilesError) {
    console.error('Error fetching profiles and stores:', profilesError);
    return [];
  }

  const contentItems: ContentItem[] = files
  .filter(file => file.name !== '.emptyFolderPlaceholder')
  .map((file, index) => {
    const { data: publicUrlData } = supabase.storage.from('files').getPublicUrl(`public/${file.name}`);
    const randomProfile = profiles?.[index % profiles.length];
    
    // Simulate status
    const statuses: ContentItem['status'][] = ['active', 'archived', 'draft', 'scheduled'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: file.id,
      title: file.name,
      file_url: publicUrlData.publicUrl,
      // @ts-ignore
      type: getContentType(file.metadata?.mimetype || 'other'),
      // @ts-ignore
      file_size: file.metadata?.size || 0,
      created_at: file.created_at,
      status: randomStatus,
      user_id: randomProfile?.id || 'unknown-user',
      user_email: randomProfile?.email || 'Unknown',
      stores: randomProfile?.stores[0] ? {
        // @ts-ignore
        name: randomProfile.stores[0].name,
        // @ts-ignore
        brand_company: randomProfile.stores[0].brand_company
      } : null,
      campaigns: null, // Placeholder
    };
  });

  return contentItems;
}

export async function fetchStoresByUserId(userId: string) {
    if (!userId) return { success: false, error: 'User ID is required.' };
    const supabase = await createClient();

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
    const supabase = await createClient();

    // NOTE: This is a placeholder implementation.
    // We are generating random stats. In a real application, you would
    // query your 'content' or 'files' table with a where clause for the userId.
    const stats = {
        total: Math.floor(Math.random() * 200),
        active: Math.floor(Math.random() * 100),
        scheduled: Math.floor(Math.random() * 50),
        thisMonth: Math.floor(Math.random() * 30),
    };

    return { success: true, stats };
}

export async function fetchClientProfileById(clientId: string) {
    if (!clientId) return { success: false, error: 'Client ID is required' };
    const supabase = await createClient({ useServiceRole: true });

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
    const supabase = await createClient({ useServiceRole: true });
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
    const supabase = await createClient({ useServiceRole: true });

    // 1. Delete the file from storage
    const filePath = new URL(fileUrl).pathname.split('/files/').pop();
    if (filePath) {
        const { error: storageError } = await supabase.storage.from('files').remove([filePath]);
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
