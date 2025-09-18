import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

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
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-muted-foreground', className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.label}>
            <div className="flex items-center">
              {item.href && !item.current ? (
                <Link href={item.href} className="hover:text-primary hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(item.current && 'font-semibold text-foreground')}>
                  {item.label}
                </span>
              )}
              {index < items.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-2 shrink-0" />
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
