
// components/admin/AdminClientOverview.tsx

'use client';

import {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {Badge} from '@/components/ui/badge';
import {Activity, Calendar, Eye, Store, TrendingUp, Upload, Users} from 'lucide-react';
import {format} from 'date-fns';
import Link from 'next/link';
import type {ClientOverview, OverviewStats} from '@/app/actions/client-overview-action';
import {getClientOverview} from '@/app/actions/client-overview-action';
import {LoadingSpinner} from '@/components/ui/loading-spinner'; // Import LoadingSpinner
import {StatCard} from '@/components/ui/StatCard';

export function AdminClientOverview() {
    const [clients, setClients] = useState<ClientOverview[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<OverviewStats>({
        totalClients: 0, activeClients: 0, totalUploads: 0, recentActivity: 0
    });

    const fetchClientOverview = async () => {
        setLoading(true);
        try {
            const result = await getClientOverview();
            if (result.success) {
                setClients(result.clients);
                setStats(result.stats);
            } else {
                console.error('AdminClientOverview: Error fetching client overview:', result.error);
            }
        } catch (error) {
            console.error('AdminClientOverview: Exception during fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientOverview();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <LoadingSpinner size="lg" text="Loading client overview..."/>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={Users} value={stats.totalClients} label="Total Clients" iconColorClass="text-primary"/>
                <StatCard icon={Activity} value={stats.activeClients} label="Active This Week"
                          iconColorClass="text-chart-2"/>
                <StatCard icon={Upload} value={stats.totalUploads} label="Total Uploads"
                          iconColorClass="text-chart-4"/>
                <StatCard icon={TrendingUp} value={stats.recentActivity} label="Recent Activity"
                          iconColorClass="text-chart-5"/>
            </div>

            {/* Recent Clients */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5"/>
                            Recent Clients
                        </CardTitle>
                        <Link href="/admin/clients">
                            <Button variant="outline" size="sm">
                                View All Clients
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {clients.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                            <h3 className="text-lg font-medium text-foreground mb-2">No clients yet</h3>
                            <p className="text-muted-foreground">
                                No clients have registered yet. They will appear here once they sign up.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {clients.map(client => (
                                <div key={client.id}
                                     className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors border border-border">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-medium text-foreground">
                                                {client.email}
                                            </h4>
                                            <Badge variant="secondary" className="text-xs">
                                                Client
                                            </Badge>
                                        </div>

                                        <div
                                            className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3"/>
                                                <span>Joined {format(new Date(client.created_at), 'MMM dd')}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Store className="w-3 h-3"/>
                                                <span>{client.stores?.length || 0} store{client.stores?.length !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Upload className="w-3 h-3"/>
                                                <span>{client.content_count || 0} upload{client.content_count !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3"/>
                                                <span>{client.active_campaigns || 0} active</span>
                                            </div>
                                        </div>

                                        {client.stores && client.stores.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {client.stores.slice(0, 2).map(store => (
                                                    <Badge key={store.id} variant="outline" className="text-xs">
                                                        {store.name}
                                                    </Badge>
                                                ))}
                                                {client.stores.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{client.stores.length - 2} more
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        {client.latest_upload && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Last
                                                upload: {format(new Date(client.latest_upload), 'MMM dd, yyyy HH:mm')}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href={`/dashboard?admin_view=${client.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4 mr-1"/>
                                                            View
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>View client dashboard</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
