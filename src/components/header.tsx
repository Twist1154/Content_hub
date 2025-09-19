
import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './logo';
import { createClient } from '@/lib/supabase/server';
import { UserNav } from './user-nav';
import { MobileNav } from './mobile-nav';
import { ThemeSwitcher } from './ui/ThemeSwitcher';
import { signOut } from '@/app/actions/auth-actions';

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
              <UserNav user={user} onSignOut={async () => {
                'use server';
                await signOut();
              }} />
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
