
// src/components/content/ContentManager.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ContentItem, GroupingMode, ViewMode } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { ViewSwitcher } from './ViewSwitcher';
import { GroupingSwitcher } from './GroupingSwitcher';
import { AdminContentCard } from './AdminContentCard';
import { ClientContentCard } from './ClientContentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ServerCrash } from 'lucide-react';

interface ContentManagerProps {
    fetchAction: () => Promise<ContentItem[]>;
    showGrouping?: boolean;
    defaultView?: GroupingMode;
    isAdminView?: boolean;
}

export function ContentManager({
    fetchAction,
    showGrouping = false,
    defaultView = 'none',
    isAdminView = false,
}: ContentManagerProps) {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [groupingMode, setGroupingMode] = useState<GroupingMode>(defaultView);
    const [filter, setFilter] = useState('');
    const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

    useEffect(() => {
        const loadContent = async () => {
            try {
                setLoading(true);
                const contentItems = await fetchAction();
                setItems(contentItems);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error("Failed to fetch content:", err);
            } finally {
                setLoading(false);
            }
        };
        loadContent();
    }, [fetchAction]);

    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.title.toLowerCase().includes(filter.toLowerCase()) ||
            (isAdminView && item.user_email && item.user_email.toLowerCase().includes(filter.toLowerCase())) ||
            (isAdminView && item.stores?.brand_company && item.stores.brand_company.toLowerCase().includes(filter.toLowerCase())) ||
            (isAdminView && item.stores?.name && item.stores.name.toLowerCase().includes(filter.toLowerCase()))
        );
    }, [items, filter, isAdminView]);

    const groupedItems = useMemo(() => {
        if (groupingMode === 'none') {
            return { 'All Content': filteredItems };
        }
        const key = groupingMode === 'company' ? 'brand_company' : 'name';
        return filteredItems.reduce((acc, item) => {
            const groupKey = item.stores?.[key] || 'Uncategorized';
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(item);
            return acc;
        }, {} as Record<string, ContentItem[]>);
    }, [filteredItems, groupingMode]);

    const handleCardClick = (item: ContentItem) => {
        setSelectedItem(item);
        // Here you would open a modal or a side panel with the item details
        console.log("Selected item:", item);
    };

    const ContentCard = isAdminView ? AdminContentCard : ClientContentCard;

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-grow">
                    <Input
                        placeholder={isAdminView ? "Filter by name, email, company..." : "Filter by name..."}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {showGrouping && (
                         <GroupingSwitcher
                            groupingMode={groupingMode}
                            setGroupingMode={setGroupingMode}
                        />
                    )}
                    <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
                </div>
            </div>

            {/* Content Display */}
            {loading ? (
                <div className={cn(
                    "grid gap-4",
                    viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
                )}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className={cn(viewMode === 'grid' ? "h-64" : "h-24")} />
                    ))}
                </div>
            ) : error ? (
                <Alert variant="destructive">
                    <ServerCrash className="h-4 w-4" />
                    <AlertTitle>Error Loading Content</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedItems).map(([groupName, groupItems]) => (
                         groupItems.length > 0 && (
                            <div key={groupName}>
                                {showGrouping && groupingMode !== 'none' && (
                                     <h3 className="text-lg font-semibold mb-4 capitalize">{groupName}</h3>
                                )}
                               <div className={cn(
                                    "grid gap-4",
                                    viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
                                )}>
                                    {groupItems.map(item => (
                                        <AdminContentCard key={item.id} item={item} onClick={handleCardClick} />
                                    ))}
                                </div>
                            </div>
                         )
                    ))}
                     {filteredItems.length === 0 && !loading && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No content found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
