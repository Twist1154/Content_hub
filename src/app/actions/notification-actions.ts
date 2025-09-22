'use server';

import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sendBulkEmail } from '@/lib/notifications/email';

interface UploadItemSummary {
  title: string;
  storeId: string;
}

export async function notifyAdminsOfContentUpload(params: {
  userId: string;
  items: UploadItemSummary[];
}): Promise<{ success: boolean; error?: string }>{
  try {
    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

    // Fetch admins' emails
    const { data: admins, error: adminErr } = await supabase
      .from('profiles')
      .select('email')
      .eq('role', 'admin');

    if (adminErr) {
      console.error('[notifyAdminsOfContentUpload] Error fetching admins:', adminErr);
      return { success: false, error: adminErr.message };
    }

    const to = (admins || []).map(a => a.email).filter(Boolean) as string[];
    if (to.length === 0) {
      console.warn('[notifyAdminsOfContentUpload] No admin recipients found.');
      return { success: true };
    }

    // Fetch client information
    const { data: clientProfile, error: clientErr } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', params.userId)
      .single();

    if (clientErr) {
      console.warn('[notifyAdminsOfContentUpload] Could not fetch client profile, continuing:', clientErr.message);
    }

    const subject = 'New content uploaded by client';
    const total = params.items.length;

    const htmlItems = params.items
      .slice(0, 10) // cap preview
      .map((i, idx) => `<li>#${idx + 1} - ${escapeHtml(i.title)} (store: ${escapeHtml(i.storeId)})</li>`) // storeId as fallback; could be joined later for names
      .join('');

    const more = total > 10 ? `<p>...and ${total - 10} more item(s).</p>` : '';

    const html = `
      <div>
        <p>Hello Admin,</p>
        <p><strong>${total}</strong> new content item(s) were uploaded by client ${escapeHtml(clientProfile?.email || params.userId)}.</p>
        <ul>${htmlItems}</ul>
        ${more}
        <p>— Uploader Notification Service</p>
      </div>
    `;

    const sendRes = await sendBulkEmail({ to, subject, html });
    if (!sendRes.success) {
      return { success: false, error: sendRes.error };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[notifyAdminsOfContentUpload] Unexpected error:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
