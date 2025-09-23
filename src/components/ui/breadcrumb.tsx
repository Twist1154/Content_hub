
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { fetchUserRole } from '@/app/actions/data-actions';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        // Get user role using centralized function
        const result = await fetchUserRole(user.id);

        if (result.success) {
          setUserRole(result.role || 'client');
        } else {
          console.error('Error fetching user role:', result.error);
          setUserRole('client'); // Default fallback
        }
      }
    };

    getUser();
  }, [supabase]);

    const getHomeUrl = () => {
        if (!user) return '/';
        return userRole === 'admin' ? '/admin' : '/dashboard';
    };
  // Filter items to only include those with a valid href or the current item
  const validItems = items.filter(item => item.href || item.current);
  
  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}>
      <Link 
        href={getHomeUrl()}
        className="flex items-center hover:text-foreground transition-colors"
        title={user ? (userRole === 'admin' ? 'Admin Dashboard' : 'Dashboard') : 'Home'}
      >
        <Home className="w-4 h-4" />
      </Link>

      {validItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="w-4 h-4" />
          {item.href && !item.current ? (
            <Link 
              href={item.href} 
              className="hover:text-foreground transition-colors"
              title={item.label}
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={cn(
                item.current && 'text-foreground font-medium'
              )}
              title={item.label}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
