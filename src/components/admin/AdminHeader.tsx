// src/components/admin/AdminHeader.tsx
import { UserNav } from '@/components/user-nav';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import type { User } from '@supabase/supabase-js';

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
  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <Breadcrumb items={breadcrumbItems} className="mt-1" />
          </div>
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}