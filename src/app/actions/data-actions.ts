'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

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
