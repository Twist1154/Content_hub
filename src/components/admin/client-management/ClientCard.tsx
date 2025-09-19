
// src/components/admin/client-management/ClientCard.tsx
'use client';

import { Client } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Eye, Settings, Store, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ClientCardProps {
  client: Client;
  onSelect: (client: Client) => void;
  onDownloadData: (clientId: string, clientEmail: string) => void;
}

export function ClientCard({ client, onSelect, onDownloadData }: ClientCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{client.email}</h3>
              <Badge variant="secondary">Client</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(client.created_at), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span>{client.stores?.length || 0} store{client.stores?.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>{client.content_count || 0} upload{client.content_count !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {client.stores && client.stores.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-foreground mb-1">Stores:</p>
                <div className="flex flex-wrap gap-2">
                  {client.stores.map((store: any) => (
                    <Badge key={store.id} variant="outline" className="text-xs">
                      {store.name} ({store.brand_company})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {client.latest_upload && (
              <p className="text-xs text-muted-foreground mt-2">
                Last upload: {format(new Date(client.latest_upload), 'MMM dd, yyyy HH:mm')}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/dashboard?admin_view=${client.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Dashboard
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View client dashboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownloadData(client.id, client.email)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Data
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download client data as CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onSelect(client)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Manage client account</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
