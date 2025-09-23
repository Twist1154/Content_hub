// src/components/admin/client-management/ClientList.tsx
'use client';

import { User } from "@/app/actions/get-clients-action";
import { ClientCard } from './ClientCard';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { Search, UserPlus, Users, Shield } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface ClientListProps {
    users: User[];
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onInviteClick: () => void;
    onSyncClick: () => void;
    onUserSelect: (user: User) => void;
    onDownloadData: (userId: string, userEmail: string) => void;
}

export function ClientList({
   users,
   searchTerm,
   onSearchChange,
   onInviteClick,
   onSyncClick,
   onUserSelect,
   onDownloadData
}: ClientListProps) {
    return (
        <div className="space-y-6">
            {/* Header with Search and Invite */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <Input
                        placeholder="Search users by email or store..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4"/>
                        {users.length} user{users.length !== 1 ? 's' : ''}
                    </div>

                    <Tooltip content="Invite a new client to the platform">
                        <Button onClick={onInviteClick}>
                            <UserPlus className="w-4 h-4 mr-2"/>
                            Invite User
                        </Button>
                    </Tooltip>

                    <Tooltip content="Sync all users' app_metadata with their profile roles">
                        <Button onClick={onSyncClick} variant="outline">
                            <Shield className="w-4 h-4 mr-2"/>
                            Sync All Roles
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* User Cards */}
            <div className="grid gap-4">
                {users.map(user => (
                    <ClientCard
                        key={user.id}
                        user={user}
                        onSelect={onUserSelect}
                        onDownloadData={onDownloadData}
                    />
                ))}
            </div>

            {users.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
                    <p className="text-muted-foreground">
                        {searchTerm ? 'Try adjusting your search terms.' : 'There are no users in the system.'}
                    </p>
                </div>
            )}
        </div>
    );
}