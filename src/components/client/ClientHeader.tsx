
// components/client/ClientHeader.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { UserNav, UserNavHeader, UserNavItem, UserNavSeparator } from '@/components/user-nav';
import { ChevronLeft, Eye, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Breadcrumb } from '../ui/breadcrumb';
import { signOut } from '@/app/actions/auth-actions';

interface ClientHeaderProps {
    user: any;
    isAdminView?: boolean;
    viewingClient?: any;
}

export function ClientHeader({ user, isAdminView, viewingClient }: ClientHeaderProps) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const result = await signOut();
            if (result.success) {
                if (typeof window !== 'undefined') {
                    localStorage.clear();
                    sessionStorage.clear();
                }
                router.push('/');
                router.refresh();
            } else {
                console.error('Logout failed:', result.error);
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            console.error('Logout error:', error);
            router.push('/');
            router.refresh();
        }
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(true);
    };

  const getHeaderTitle = () => {
    if (isAdminView) {
      return `Viewing: ${viewingClient.profile?.email}`;
    }
    // This is a simple way to check the current page from the client side
    if (typeof window !== 'undefined') {
        if (window.location.pathname.includes('/profile')) return 'User Profile';
        if (window.location.pathname.includes('/settings')) return 'Settings';
    }
    return 'My Dashboard';
  }

  return (
    <>
      <header className="bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-foreground">
                {getHeaderTitle()}
              </h1>
              <Breadcrumb
                items={[
                  {
                    label: getHeaderTitle(),
                    current: true,
                  },
                ]}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <UserNav email={isAdminView ? viewingClient?.profile?.email : user.email}>
                    <UserNavHeader
                        title={isAdminView ? 'Viewing as Admin' : 'Signed in as'}
                        email={isAdminView ? viewingClient?.profile?.email : user.email}
                        note={isAdminView ? `Admin: ${user.email}` : undefined}
                        noteVariant="primary"
                    />
                            <div className="py-1">
                        <UserNavItem onClick={() => router.push('/profile')}>
                            <UserIcon className="w-4 h-4" /> User Profile
                        </UserNavItem>
                        <UserNavItem onClick={() => router.push('/settings')}>
                            <Settings className="w-4 h-4" /> Settings
                        </UserNavItem>
                        <UserNavSeparator />
                        <UserNavItem onClick={confirmLogout}>
                            <LogOut className="w-4 h-4 text-destructive" />
                            <span className="text-destructive">Sign Out</span>
                        </UserNavItem>
                        </div>
                </UserNav>
            </div>
          </div>
        </div>
      </header>
      {isAdminView && (
        <div className="bg-primary/10 border-b border-primary/20">
          <div className="container mx-auto px-4 py-2">
            <Alert variant="default" className="border-0 p-0 bg-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-primary" />
                  <div>
                    <AlertTitle className="font-semibold text-primary">
                      Admin View
                    </AlertTitle>
                    <AlertDescription className="text-primary/90">
                      You are viewing the dashboard as{' '}
                      {viewingClient.profile?.email}. Any actions you take will
                      be on their behalf.
                    </AlertDescription>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => router.push('/admin/clients')}>
                  <ChevronLeft className="mr-2" />
                  Back to Client List
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      )}
       <ConfirmModal
            isOpen={showLogoutConfirm}
            onClose={() => setShowLogoutConfirm(false)}
            onConfirm={handleLogout}
            title="Confirm Sign Out"
            description="Are you sure you want to sign out? You'll need to sign in again to access your dashboard."
            confirmText="Sign Out"
            confirmVariant="destructive"
        />
    </>
  );
}
