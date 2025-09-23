// components/client/ClientHeader.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tooltip } from '@/components/ui/Tooltip';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { LogOut, User, Settings, Shield, Eye } from 'lucide-react';
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { UserNav, UserNavHeader, UserNavItem, UserNavSeparator } from "@/components/ui/UserNav";
import {Logo} from "@/components/logo";
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
                // Clear any local storage or session data if needed
                localStorage.clear();
                sessionStorage.clear();

                // Redirect to home page and refresh to clear cache
                router.push('/');
                router.refresh();
            } else {
                console.error('Logout failed:', result.error);
                // Fallback: still redirect and refresh
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback: still redirect and refresh
            router.push('/');
            router.refresh();
        }
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(true);
    };

    return (
        <>
            <header className="bg-card text-card-foreground shadow-sm border-b border-border sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        {/* Left side (This is specific to ClientHeader, so it stays) */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <Logo className="w-12 h-12" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-foreground">
                                            {isAdminView ? 'Admin View: Client Dashboard' : 'Client Dashboard'}
                                        </h1>
                                        {isAdminView && (
                                            <Tooltip
                                                content="You are viewing this client's dashboard as an admin">
                                                <Shield className="w-5 h-5 text-primary" />
                                            </Tooltip>
                                        )}
                                    </div>
                                    <Breadcrumb
                                        items={[
                                            ...(isAdminView ? [{ label: 'Admin Dashboard', href: '/admin' }] : []),
                                            {
                                                label: isAdminView ? `Client: ${viewingClient?.profile?.email}` : 'Dashboard',
                                                current: true
                                            }
                                        ]}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right side - User Menu */}
                        <div className="flex items-center gap-4">
                            {isAdminView && (
                                <div className="text-sm text-accent-foreground bg-accent px-3 py-1 rounded-full border border-border">
                                    <Eye className="w-4 h-4 inline mr-1" />
                                    Admin View
                                </div>
                            )}
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
                                        <User className="w-4 h-4" /> User Profile
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
