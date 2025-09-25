'use server';

import Link from 'next/link';
import { Button } from './ui/Button';
import { Logo } from './Logo';
import { MobileNav } from './mobile-nav';
import { ThemeSwitcher } from './ui/ThemeSwitcher';
import { signOut } from '@/app/actions/auth-actions';
import { getCurrentUser } from '@/lib/auth';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ClientHeader } from '@/components/client/ClientHeader';
import { headers } from 'next/headers';
import { fetchClientProfileById } from '@/app/actions/data-actions';

async function getPathnameAndSearch() {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';
    const search = headersList.get('x-search') || '';
    return { pathname, search };
}

function getAdminHeaderProps(pathname: string, user: any) {
    if (pathname.startsWith('/admin/clients')) {
        return {
            user,
            title: "Client Management",
            breadcrumbItems: [
                { label: 'Admin Dashboard', href: '/admin' },
                { label: 'Client Management', current: true }
            ]
        };
    }
    if (pathname.startsWith('/admin/content')) {
        return {
            user,
            title: "Content Library",
            breadcrumbItems: [
                { label: 'Admin Dashboard', href: '/admin' },
                { label: 'Content Library', current: true }
            ]
        };
    }
     if (pathname.startsWith('/admin/downloads')) {
        return {
            user,
            title: "Bulk Download",
            breadcrumbItems: [
                { label: 'Admin Dashboard', href: '/admin' },
                { label: 'Bulk Download', current: true }
            ]
        };
    }
    // Default for /admin
    return {
        user,
        title: "Admin Dashboard",
        breadcrumbItems: [{ label: 'Admin Dashboard', current: true }]
    };
}


export default async function Header() {
  const user = await getCurrentUser();
  const { pathname, search } = await getPathnameAndSearch();
  
  // If no user is logged in, show the guest header
  if (!user) {
    return (
        <header className="absolute top-0 left-0 right-0 z-50 p-4 bg-transparent">
          <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">HapoHub</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                  <nav className="flex items-center gap-2">
                    <Link href="/auth/client/signin">
                      <Button variant="ghost">Sign in</Button>
                    </Link>
                    <Link href="/auth/client/signup">
                      <Button>Sign up</Button>
                    </Link>
                  </nav>
                 <ThemeSwitcher />
              </div>

              <div className="md:hidden">
                <MobileNav user={null} />
              </div>
            </div>
          </div>
        </header>
    );
  }

  // If a user is logged in, determine which header to show
  const adminViewClientId = new URLSearchParams(search).get('admin_view');
  const isAdminViewingClient = !!(user.profile?.role === 'admin' && adminViewClientId);

  // If it's an admin viewing a client's dashboard, show the ClientHeader in a special mode
  if (isAdminViewingClient) {
      const profileResult = await fetchClientProfileById(adminViewClientId as string);
      const viewingClient = (profileResult.success && profileResult.profile) 
          ? { ...user, profile: profileResult.profile } 
          : user;

      return <ClientHeader user={user} isAdminView={true} viewingClient={viewingClient} />;
  }

  // If the user is an admin (and not in client view mode), show the AdminHeader
  if (user.profile?.role === 'admin') {
    const props = getAdminHeaderProps(pathname, user);
    return <AdminHeader {...props} />;
  }

  // Otherwise, it must be a client, so show the standard ClientHeader
  return <ClientHeader user={user} isAdminView={false} viewingClient={user} />;
}
