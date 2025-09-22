// src/components/content/ContentManager.tsx
'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Eye,
    Filter,
    Folder,
    LayoutGrid,
    List,
    MapPin,
    Search,
    ArrowDownUp,
} from 'lucide-react';
import {format} from 'date-fns';
import {LoadingSpinner} from '@/components/ui/loading-spinner';
import {ContentDetailModal} from "@/components/content/ContentDetailModal";
import {ContentCard} from "@/components/content/ContentCard";
import {AdminContentCard} from "@/components/content/AdminContentCard";
import type { ContentItem } from "@/lib/types";
import {formatFileSize, getStatusBadge, getTypeIcon} from "@/lib/content-utils.tsx";
import {ContentPreviewTooltip} from '@/components/content/ContentPreviewTooltip';
import {cn} from '@/lib/utils';
import {Badge} from "@/components/ui/badge";
import {ConfirmModal} from '@/components/ui/ConfirmModal';
import {deleteContent} from '@/app/actions/data-actions';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import { ServerCrash } from 'lucide-react';

// Props to configure the component's behavior
interface ContentManagerProps {
    fetchAction: () => Promise<{ success: boolean; content?: ContentItem[]; error?: string; }>;
    showFilters?: boolean;
    showGrouping?: boolean;
    defaultView?: 'grid' | 'list' | 'location' | 'company';
    isAdminView?: boolean; // True when an admin is viewing a client's dashboard
}

// Interfaces for internal state
interface FilterOptions {
    search: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
}

interface SortOptions {
    field: 'created_at' | 'title' | 'file_size' | 'type';
    direction: 'asc' | 'desc';
}

interface GroupedContent {
    [key: string]: {
        [key: string]: {
            [key: string]: ContentItem[];
        };
    };
}

export function ContentManager({
   fetchAction,
   showFilters = false,
   showGrouping = false,
   defaultView = 'grid',
   isAdminView = false,
}: ContentManagerProps) {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'location' | 'company'>(defaultView);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [lastSelectedItem, setLastSelectedItem] = useState<string | null>(null);
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<ContentItem | null>(null);
    const [filters, setFilters] = useState<FilterOptions>({
        search: '',
        type: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [sort, setSort] = useState<SortOptions>({field: 'created_at', direction: 'desc'});
    const [currentPage, setCurrentPage] = useState(1);

    const fetchContent = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchAction();
            if (result.success) {
                setContent(result.content || []);
            } else {
                throw new Error(result.error || 'Failed to fetch content.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred fetching content.');
            setContent([]); // Ensure content is an array on error
        } finally {
            setLoading(false);
        }
    }, [fetchAction]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const processedContent = useMemo(() => {
        let items = [...content];
        if (showFilters) {
            items = items.filter(item => {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch = !filters.search ||
                    item.title.toLowerCase().includes(searchLower) ||
                    (item.stores?.name?.toLowerCase() ?? '').includes(searchLower) ||
                    (item.stores?.brand_company?.toLowerCase() ?? '').includes(searchLower);

                const matchesType = !filters.type || item.type === filters.type;
                const matchesStatus = !filters.status || item.status === filters.status;
                
                const itemDate = new Date(item.created_at);
                const matchesStartDate = !filters.startDate || itemDate >= new Date(filters.startDate);
                const matchesEndDate = !filters.endDate || itemDate <= new Date(filters.endDate);

                return matchesSearch && matchesType && matchesStatus && matchesStartDate && matchesEndDate;
            });
        }
        items.sort((a, b) => {
            let aValue: any = a[sort.field];
            let bValue: any = b[sort.field];
            if (sort.field === 'created_at') {
                aValue = new Date(a.created_at).getTime();
                bValue = new Date(b.created_at).getTime();
            } else if (sort.field === 'file_size') {
                aValue = a.file_size;
                bValue = b.file_size;
            } else {
                aValue = (a[sort.field] ?? '').toString().toLowerCase();
                bValue = (b[sort.field] ?? '').toString().toLowerCase();
            }

            if (aValue === bValue) return 0;
            return sort.direction === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        });

        return items;
    }, [content, filters, sort, showFilters]);

    const groupedContent = useMemo(() => {
        if (!showGrouping || (viewMode !== 'location' && viewMode !== 'company')) return {};

        const grouped: GroupedContent = {};
        processedContent.forEach(item => {
            const address = item.stores?.address ?? '';
            const locationKey = address ? address.split(',')[0].trim() : 'Unknown Location';
            const companyKey = item.stores?.brand_company ?? 'Unknown Company';
            const primaryKey = viewMode === 'location' ? locationKey : companyKey;
            const secondaryKey = viewMode === 'location' ? companyKey : locationKey;
            const type = item.type;

            if (!grouped[primaryKey]) grouped[primaryKey] = {};
            if (!grouped[primaryKey][secondaryKey]) grouped[primaryKey][secondaryKey] = {};
            if (!grouped[primaryKey][secondaryKey][type]) grouped[primaryKey][secondaryKey][type] = [];
            grouped[primaryKey][secondaryKey][type].push(item);
        });
        return grouped;

    }, [processedContent, viewMode, showGrouping]);

    const itemsPerPage = viewMode === 'grid' ? 12 : 10;
    const totalPages = Math.ceil(processedContent.length / itemsPerPage);
    const paginatedContent = processedContent.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDeleteRequest = (item: ContentItem) => setDeletingItem(item);
    const handleDeleteConfirm = async () => {
        if (!deletingItem) return;
        // The deleteContent action doesn't exist yet, we will create it.
        // For now, we simulate success.
        console.log("Deleting:", deletingItem.id);
        setDeletingItem(null);
        await fetchContent(); // Re-fetch after "deletion"
    };

    const handleSort = (field: SortOptions['field']) => {
        setSort(prev => ({field, direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'}));
    };
    const clearFilters = () => setFilters({search: '', type: '', status: '', startDate: '', endDate: ''});

    const handleSelectItem = (id: string, shiftKey: boolean) => {
        const currentIndex = processedContent.findIndex(item => item.id === id);
        let newSelectedItems = [...selectedItems];

        if (shiftKey && lastSelectedItem) {
            const lastIndex = processedContent.findIndex(item => item.id === lastSelectedItem);
            if (lastIndex !== -1) {
                const start = Math.min(currentIndex, lastIndex);
                const end = Math.max(currentIndex, lastIndex);
                const itemsToSelect = processedContent.slice(start, end + 1).map(item => item.id);
                // This logic adds the range to the current selection
                itemsToSelect.forEach(itemId => {
                    if (!newSelectedItems.includes(itemId)) {
                        newSelectedItems.push(itemId);
                    }
                });
            }
        } else {
             if (newSelectedItems.includes(id)) {
                newSelectedItems = newSelectedItems.filter(itemId => itemId !== id);
            } else {
                newSelectedItems.push(id);
            }
        }
        
        setSelectedItems(newSelectedItems);
        setLastSelectedItem(id);
    };


    if (loading) return <div className="p-8 flex justify-center"><LoadingSpinner text="Loading content..."/></div>;

    if (error) {
         return (
            <Alert variant="destructive">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Error Loading Content</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    const isClientDashboard = !isAdminView;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5"/> View Controls
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                                <Input
                                    placeholder="Search..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                                    className="pl-10"/>
                            </div>
                            <select
                                className={cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1')}
                                value={filters.type}
                                onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}>
                                <option value="">All Types</option>
                                <option value="image">Images</option>
                                <option value="video">Videos</option>
                                <option value="audio">Audio</option>
                                <option value="document">Documents</option>
                            </select>
                            <select
                                className={cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1')}
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}>
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="archived">Archived</option>
                                <option value="draft">Draft</option>
                            </select>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters(prev => ({...prev, startDate: e.target.value}))}
                            />
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters(prev => ({...prev, endDate: e.target.value}))}
                            />
                        </div>
                    )}
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-2">
                            {showFilters &&
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </Button>}
                            <div className="text-sm text-muted-foreground">
                                Showing {processedContent.length} of {content.length} items
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex rounded-md border border-border">
                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                            size="sm" onClick={() => setViewMode('grid')}
                                            className="rounded-r-none">
                                            <LayoutGrid className="w-4 h-4"/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Grid View</TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                                {isClientDashboard && <TooltipProvider><Tooltip>
                                    <TooltipTrigger asChild>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm" onClick={() => setViewMode('list')}
                                        className="rounded-l-none border-l border-border">
                                        <List className="w-4 h-4"/>
                                    </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>List View</TooltipContent>
                                </Tooltip></TooltipProvider>}
                                {showGrouping && <TooltipProvider><Tooltip>
                                    <TooltipTrigger asChild>
                                    <Button
                                        variant={viewMode === 'location' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('location')}
                                        className="rounded-l-none border-l border-border">
                                        <MapPin className="w-4 h-4"/>
                                    </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Group by Location</TooltipContent>
                                </Tooltip></TooltipProvider>}
                                {showGrouping && <TooltipProvider><Tooltip>
                                    <TooltipTrigger asChild>
                                    <Button
                                        variant={viewMode === 'company' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('company')}
                                        className="rounded-l-none border-l border-border">
                                        <Folder className="w-4 h-4"/>
                                    </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Group by Company</TooltipContent>
                                </Tooltip></TooltipProvider>}
                            </div>
                            <div className="flex gap-1">
                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <Button variant={sort.field === 'created_at' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleSort('created_at')}>
                                        <Calendar className="w-4 h-4"/>
                                    </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Sort by Date {sort.field === 'created_at' && `(${sort.direction})`}</TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <Button variant={sort.field === 'title' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleSort('title')}>
                                            A-Z
                                    </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Sort by Name {sort.field === 'title' && `(${sort.direction})`}</TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <Button variant={sort.field === 'file_size' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleSort('file_size')}>
                                            <ArrowDownUp className="w-4 h-4" />
                                    </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Sort by Size {sort.field === 'file_size' && `(${sort.direction})`}</TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {processedContent.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {content.length === 0 ? 'No content uploaded yet' : 'No content matches filters'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {content.length === 0 ? 'Upload content to get started.' : 'Try adjusting your search criteria.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {paginatedContent.map(item => (
                                <ContentCard
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedItems.includes(item.id)}
                                    onSelectItem={(id: string) => handleSelectItem(id, false)}
                                    onViewDetails={() => setSelectedContent(item)}
                                    isAdminView={isAdminView}
                                    onDeleteItem={handleDeleteRequest}
                                />
                            ))}
                        </div>
                    )}
                    {viewMode === 'list' && isClientDashboard && (
                        <Card><CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                    <tr>
                                        <th className="p-4 font-medium text-left text-foreground">Content</th>
                                        <th className="p-4 font-medium text-left text-foreground">Store</th>
                                        <th className="p-4 font-medium text-left text-foreground">Status</th>
                                        <th className="p-4 font-medium text-left text-foreground">Size</th>
                                        <th className="p-4 font-medium text-left text-foreground">Uploaded</th>
                                        <th className="p-4 font-medium text-left text-foreground">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>{paginatedContent.map(item => (
                                        <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="p-4">
                                                <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                    <div className="flex items-center gap-3 cursor-default">
                                                        {getTypeIcon(item.type)}
                                                        <div>
                                                            <p className="font-medium text-foreground">{item.title}</p>
                                                            <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                                                        </div>
                                                    </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <ContentPreviewTooltip item={item} />
                                                    </TooltipContent>
                                                </Tooltip>
                                                </TooltipProvider>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium text-foreground">
                                                    {item.stores?.name ?? 'N/A'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.stores?.brand_company ?? 'N/A'}
                                                </p>
                                            </td>
                                            <td className="p-4">{getStatusBadge(item)}</td>
                                            <td className="p-4 text-muted-foreground">
                                                {formatFileSize(item.file_size)}
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {format(new Date(item.created_at), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setSelectedContent(item)}>
                                                            <Eye className="w-4 h-4"/>
                                                        </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>View details</TooltipContent>
                                                    </Tooltip>
                                                    </TooltipProvider>
                                                    <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => handleDeleteRequest(item)}
                                                        >
                                                            <Trash2 className="w-4 h-4"/>
                                                        </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Delete Content</TooltipContent>
                                                    </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        </CardContent>
                        </Card>
                    )}

                    {(viewMode === 'location' || viewMode === 'company') && showGrouping && (
                        <div
                            className="space-y-6">{Object.entries(groupedContent).map(([primaryKey, secondaryGroups]) => (
                            <Card key={primaryKey}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {viewMode === 'location' ? <MapPin className="w-5 h-5"/> : <Folder className="w-5 h-5"/>}
                                        {primaryKey}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {Object.entries(secondaryGroups).map(([secondaryKey, typeGroups]) => (
                                            <div key={secondaryKey} className="border-l-2 border-border pl-4">
                                                <h4 className="font-medium text-foreground mb-4">{secondaryKey}</h4>
                                                <div
                                                    className="space-y-6">{Object.entries(typeGroups).map(([type, items]) => (
                                                    <div key={type}>
                                                        <div
                                                            className="flex items-center gap-2 text-md font-semibold text-foreground mb-3">
                                                            {getTypeIcon(type as ContentItem['type'])}
                                                            <span className="capitalize">
                                                                {type}
                                                            </span>
                                                            <Badge variant="secondary">
                                                                {items.length}
                                                            </Badge>
                                                        </div>
                                                        <div
                                                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                            {items.map(item =>
                                                                <AdminContentCard
                                                                    key={item.id}
                                                                    item={item}
                                                                    onClick={() => setSelectedContent(item)}
                                                                />)}
                                                        </div>
                                                    </div>
                                                ))}</div>
                                            </div>
                                        ))}</div>
                                </CardContent></Card>
                        ))}</div>
                    )}

                    {totalPages > 1 && (viewMode === 'grid' || viewMode === 'list') && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1"/>Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1"/>
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <ConfirmModal
                isOpen={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Content"
                description={`Are you sure you want to permanently delete "${deletingItem?.title}"? This cannot be undone.`}
                confirmText="Delete"
                confirmVariant="destructive"
            />
            <ContentDetailModal item={selectedContent} onClose={() => setSelectedContent(null)}/>
        </div>
    );
}
