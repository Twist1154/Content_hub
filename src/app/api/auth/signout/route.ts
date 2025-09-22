// src/app/api/auth/signout/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return NextResponse.json({ success: false, error: 'Server error during sign out.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    
  } catch (err) {
    console.error('Unexpected error in signout route:', err);
    return NextResponse.json({ success: false, error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
