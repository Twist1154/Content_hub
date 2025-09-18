
// src/components/client/ClientHeader.tsx
'use client';

import { UserNav } from '@/components/user-nav';
import type { User } from '@supabase/supabase-js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Eye, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClientHeaderProps {
  user: User & { profile?: any }; // Allow profile to be on user object from useUser hook
  isAdminView: boolean;
  viewingClientProfile: any; // The profile of the client being viewed
}

export function ClientHeader({ user, isAdminView, viewingClientProfile }: ClientHeaderProps) {
  const router = useRouter();
  const title = user.profile?.role === 'admin' ? 'Admin Profile' : 'My Profile';

  return (
    <>
      <header className="bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-foreground">
                {isAdminView ? `Viewing: ${viewingClientProfile?.email}` : (router.pathname === '/profile' ? title : 'My Dashboard')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isAdminView ? 'You are viewing this client\'s dashboard.' : 'Welcome to your content hub.'}
              </p>
            </div>
            <UserNav user={user} />
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
                            <AlertTitle className="font-semibold text-primary">Admin View</AlertTitle>
                            <AlertDescription className="text-primary/90">
                                You are viewing the dashboard as {viewingClientProfile?.email}. Any actions you take will be on their behalf.
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
    </>
  );
}
