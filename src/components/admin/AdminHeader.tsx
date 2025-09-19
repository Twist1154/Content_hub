// src/components/admin/AdminHeader.tsx
'use client';

import { UserNav } from '@/components/user-nav';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import type { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '../ui/ConfirmModal';
import { signOut } from '@/app/actions/auth-actions';


interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface AdminHeaderProps {
  user: User;
  title: string;
  breadcrumbItems: BreadcrumbItem[];
}

export function AdminHeader({ user, title, breadcrumbItems }: AdminHeaderProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  return (
    <>
    <header className="bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <Breadcrumb items={breadcrumbItems} className="mt-1" />
          </div>
          <UserNav user={user} onSignOut={confirmLogout} />
        </div>
      </div>
    </header>
    <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Sign Out"
        description="Are you sure you want to sign out of your admin account?"
        confirmText="Sign Out"
        confirmVariant='destructive'
    />
    </>
  );
}
