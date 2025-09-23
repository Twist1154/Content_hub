// components/ui/UserNav.tsx 

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// We create sub-components for a flexible API
interface UserNavProps {
    email: string;
    children: React.ReactNode;
}

export function UserNav({ email, children }: UserNavProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <>
            <div className="relative">
                <Tooltip content="User menu">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2"
                    >
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">{email}</span>
                        <ChevronDown className={cn('w-4 h-4 transition-transform', dropdownOpen && 'rotate-180')} />
                    </Button>
                </Tooltip>
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-popover rounded-lg shadow-lg border border-border py-1 z-50">
                        {children}
                    </div>
                )}
            </div>
            {/* Backdrop for dropdown */}
            {dropdownOpen && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDropdownOpen(false)}
                />
            )}
        </>
    );
}

// Helper components for building the dropdown menu content
export function UserNavHeader({ title, email, note, noteVariant = 'default' }: { title: string, email: string, note?: string, noteVariant?: 'default' | 'primary' }) {
    return (
        <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium text-popover-foreground">{title}</p>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
            {note && <p className={cn('text-xs mt-1', noteVariant === 'primary' ? 'text-primary' : 'text-muted-foreground')}>{note}</p>}
        </div>
    );
}

export function UserNavItem({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
    return (
        <button onClick={onClick} className="w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-accent flex items-center gap-2">
            {children}
        </button>
    );
}

export function UserNavSeparator() {
    return <div className="border-t border-border my-1"></div>;
}
