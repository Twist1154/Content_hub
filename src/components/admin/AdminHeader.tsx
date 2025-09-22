// components/admin/AdminHeader.tsx

'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Tooltip} from '@/components/ui/tooltip';
import {Breadcrumb} from '@/components/ui/breadcrumb';
import {LogOut, Settings, Shield, User, Users} from 'lucide-react';
import {ThemeSwitcher} from '@/components/ui/ThemeSwitcher';
import {ConfirmModal} from '@/components/ui/ConfirmModal';
import { UserNav, UserNavHeader, UserNavItem, UserNavSeparator } from "@/components/user-nav";
import {Logo} from "@/components/logo";
import { signOut } from '@/app/actions/auth-actions';

interface AdminHeaderProps {
    user: any;
    title?: string;
    breadcrumbItems?: Array<{ label: string; href?: string; current?: boolean }>;
}

export function AdminHeader({user, title = 'Admin Dashboard', breadcrumbItems}: AdminHeaderProps) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        signOut();
        router.push('/');
        router.refresh();
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(true);
    };

    const defaultBreadcrumbs = [
        {label: 'Admin Dashboard', current: true}
    ];

    return (
        <>
            <header className="bg-card text-card-foreground shadow-sm border-b border-border sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        {/* Left side (This is specific to AdminHeader, so it stays) */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <Logo className="w-12 h-12" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                                         <Tooltip content="Admin dashboard with full system access">
                                            <Shield className="w-5 h-5 text-primary"/>
                                        </Tooltip>
                                    </div>
                                    <Breadcrumb
                                        items={breadcrumbItems || defaultBreadcrumbs}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right side - Now much cleaner */}
                        <div className="flex items-center gap-4">
                            <ThemeSwitcher/>

                            <UserNav email={user.email}>
                                <UserNavHeader
                                    title="Admin Account"
                                    email={user.email}
                                    note={`Role: ${user.profile?.role || 'admin'}`}
                                    noteVariant="primary"
                                />
                                <div className="py-1">
                                    <UserNavItem onClick={() => router.push('/profile')}>
                                        <User className="w-4 h-4"/> Admin Profile
                                    </UserNavItem>
                                    <UserNavItem onClick={() => router.push('/settings')}>
                                        <Settings className="w-4 h-4"/> Admin Settings
                                    </UserNavItem>
                                    <UserNavItem onClick={() => router.push('/dashboard')}>
                                        <Users className="w-4 h-4"/> Client View
                                    </UserNavItem>
                                    <UserNavSeparator/>
                                    <UserNavItem onClick={confirmLogout}>
                                        <LogOut className="w-4 h-4 text-destructive"/>
                                        <span className="text-destructive">Sign Out</span>
                                    </UserNavItem>
                                </div>
                            </UserNav>
                        </div>
                    </div>
                </div>
            </header>

            <ConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="Confirm Sign Out"
                description="Are you sure you want to sign out of your admin account? You'll need to sign in again to access the admin dashboard."
                confirmText="Sign Out"
                confirmVariant='destructive'
            />

        </>
    );
}
