// src/components/admin/client-management/ClientCard.tsx
'use client';

import { User } from '@/app/actions/get-clients-action';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Download, Eye, Settings, Store, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface ClientCardProps {
  user: User;
  onSelect: (user: User) => void;
  onDownloadData: (userId: string, userEmail: string) => void;
}

export function ClientCard({ user, onSelect, onDownloadData }: ClientCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{user.email}</h3>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span>{user.stores?.length || 0} store{user.stores?.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>{user.content_count || 0} upload{user.content_count !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {user.stores && user.stores.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-foreground mb-1">Stores:</p>
                <div className="flex flex-wrap gap-2">
                  {user.stores.map((store: any) => (
                    <Badge key={store.id} variant="outline" className="text-xs">
                      {store.name} ({store.brand_company})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {user.latest_upload && (
              <p className="text-xs text-muted-foreground mt-2">
                Last upload: {format(new Date(user.latest_upload), 'MMM dd, yyyy HH:mm')}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {user.role === 'client' && (
              <Tooltip content="View client dashboard">
                <Link href={`/dashboard?admin_view=${user.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Button>
                </Link>
              </Tooltip>
            )}
            <Tooltip content="Download user data as CSV">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadData(user.id, user.email)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Data
              </Button>
            </Tooltip>
            <Tooltip content="Manage user account">
              <Button
                variant="default"
                size="sm"
                onClick={() => onSelect(user)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
