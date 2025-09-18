
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { ContentItem } from '@/lib/types';

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

export async function fetchAllContent(): Promise<ContentItem[]> {
  const supabase = await createClient({ useServiceRole: true });

  const { data: files, error: filesError } = await supabase
    .storage
    .from('files')
    .list('public', {
      limit: 100, // Adjust as needed
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

  // Extract user IDs from file metadata if available (or from path if structured that way)
  // This example assumes we can't get user ID directly from storage metadata easily.
  // A more robust solution might involve storing user/store IDs in file metadata on upload.
  // For now, we fetch all profiles and stores and map them.

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, stores(id, name, brand_company)');
  
  if (profilesError) {
    console.error('Error fetching profiles and stores:', profilesError);
    return [];
  }

  // Create a map for easy lookup
  const userMap = new Map();
  profiles?.forEach(p => {
    userMap.set(p.id, {
      email: p.email,
      // @ts-ignore
      storeName: p.stores[0]?.name || 'N/A',
      // @ts-ignore
      companyName: p.stores[0]?.brand_company || 'N/A'
    });
  });

  // This is a placeholder for mapping files to users.
  // In a real app, the user/store ID would be part of the file's path or metadata.
  // Here, we'll randomly assign files to users for demonstration purposes.
  const contentItems: ContentItem[] = files
  .filter(file => file.name !== '.emptyFolderPlaceholder') // Filter out placeholder
  .map((file, index) => {
    const { data: publicUrlData } = supabase.storage.from('files').getPublicUrl(`public/${file.name}`);
    const randomProfile = profiles?.[index % profiles.length]; // Assign cyclically

    return {
      id: file.id,
      name: file.name,
      url: publicUrlData.publicUrl,
      // @ts-ignore
      type: file.metadata?.mimetype || 'application/octet-stream',
      // @ts-ignore
      size: file.metadata?.size || 0,
      createdAt: file.created_at,
      userId: randomProfile?.id || 'unknown-user',
      userEmail: randomProfile?.email || 'Unknown',
      // @ts-ignore
      storeName: randomProfile?.stores[0]?.name || 'N/A',
      // @ts-ignore
      companyName: randomProfile?.stores[0]?.brand_company || 'N/A',
    };
  });

  return contentItems;
}
