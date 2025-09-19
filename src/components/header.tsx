
'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './logo';
import { UserNav } from './user-nav';
import { MobileNav } from './mobile-nav';
import { ThemeSwitcher } from './ui/ThemeSwitcher';
import { signOut } from '@/app/actions/auth-actions';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    fetchUser();
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-4 bg-transparent">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">HapoHub</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <UserNav user={user} onSignOut={signOut} />
            ) : (
              <nav className="flex items-center gap-2">
                <Link href="/auth/client/signin">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/auth/client/signup">
                  <Button>Sign up</Button>
                </Link>
              </nav>
            )}
             <ThemeSwitcher />
          </div>

          <div className="md:hidden">
            <MobileNav user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}
