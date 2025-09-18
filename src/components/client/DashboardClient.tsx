
// src/components/client/DashboardClient.tsx
'use client';

import { FileDrop } from '@/components/file-drop';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Clock, Database, UploadCloud, Users } from 'lucide-react';

interface DashboardClientProps {
    userId: string;
    isAdminView: boolean;
    initialStores: any[];
    contentStats: {
        total: number;
        active: number;
        scheduled: number;
        thisMonth: number;
    };
}

export function DashboardClient({ userId, isAdminView, initialStores, contentStats }: DashboardClientProps) {

    const stats = [
        { title: 'Total Content', value: contentStats.total, icon: Database },
        { title: 'Active Posts', value: contentStats.active, icon: UploadCloud },
        { title: 'Scheduled', value: contentStats.scheduled, icon: Clock },
        { title: 'New This Month', value: contentStats.thisMonth, icon: BarChart },
    ];

    return (
        <main className="container mx-auto px-4 py-8 space-y-8">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: File Drop */}
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Upload New Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FileDrop />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Stores and Recent Activity */}
                <div className="space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Stores
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {initialStores.length > 0 ? (
                                <ul className="space-y-3">
                                    {initialStores.map(store => (
                                        <li key={store.id} className="p-3 bg-secondary rounded-md">
                                            <p className="font-semibold">{store.name}</p>
                                            <p className="text-sm text-muted-foreground">{store.address}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No stores have been set up yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}

