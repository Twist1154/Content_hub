

'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {Input} from '@/components/ui/Input';
import {Tooltip} from '@/components/ui/Tooltip';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Delete,
    Eye,
    Filter,
    Folder,
    Grid,
    List,
    MapPin,
    Search,
    SortAsc,
    SortDesc,
    Upload
} from 'lucide-react';
import {format} from 'date-fns';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {ContentDetailModal} from "@/components/content/ContentDetailModal";
import {ContentCard} from "@/components/content/ContentCard";
import {AdminContentCard} from "@/components/content/AdminContentCard";
import {ContentItem} from "@/types/content";
import {formatFileSize, getStatusBadge, getTypeIcon} from "@/utils/contentUtils";
import {ContentPreviewTooltip} from '@/components/content/ContentPreviewTooltip';
import {cn} from '@/lib/utils';
import {Badge} from "@/components/ui/Badge";
import {ConfirmModal} from '@/components/ui/ConfirmModal';
import {deleteContent} from '@/app/actions/data-actions';
import {Notification} from '@/components/ui/Notification';

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
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'location' | 'company'>(defaultView);
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<ContentItem | null>(null);
    const [notification, setNotification] = useState({
        show: false,
        type: 'info' as 'success' | 'error' | 'info',
        message: ''
    });
    const [filters, setFilters] = useState<FilterOptions>({
        search: '',
        type: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [sort, setSort] = useState<SortOptions>({field: 'created_at', direction: 'desc'});
    const [currentPage, setCurrentPage] = useState(1);

    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        setNotification({show: true, type, message});
        setTimeout(() => setNotification(prev => ({...prev, show: false})), 5000);
    };

    const fetchContent = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchAction();
            if (result.success) {
                setContent(result.content || []);
            } else {
                showNotification('error', result.error || 'Failed to fetch content');
            }
        } catch (error: any) {
            showNotification('error', error.message || 'An unexpected error occurred fetching content.');
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
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                items = items.filter(item =>
                    item.title.toLowerCase().includes(searchLower) ||
                    (item.stores?.name?.toLowerCase() ?? '').includes(searchLower) ||
                    (item.stores?.brand_company?.toLowerCase() ?? '').includes(searchLower)
                );
            }
            // Add other filter logic here if needed in the future
        }
        items.sort((a, b) => {
            let aValue: any = a[sort.field];
            let bValue: any = b[sort.field];
            if (sort.field === 'created_at' || sort.field === 'file_size') {
                aValue = sort.field === 'created_at' ? new Date(aValue).getTime() : aValue;
                bValue = sort.field === 'created_at' ? new Date(bValue).getTime() : bValue;
            } else {
                aValue = aValue?.toString().toLowerCase() ?? '';
                bValue = bValue?.toString().toLowerCase() ?? '';
            }
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
        const result = await deleteContent(deletingItem.id, deletingItem.file_url);
        if (result.success) {
            showNotification('success', 'Content successfully deleted.');
            fetchContent();
        } else {
            showNotification('error', result.error || 'Failed to delete content.');
        }
        setDeletingItem(null);
    };

    const handleSort = (field: SortOptions['field']) => {
        setSort(prev => ({field, direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'}));
    };
    const clearFilters = () => setFilters({search: '', type: '', status: '', startDate: '', endDate: ''});

    if (loading) return <div className="p-8 flex justify-center"><LoadingSpinner text="Loading content..."/></div>;

    const isClientDashboard = showFilters;

    return (
        <div className="space-y-6">
            <Notification
                show={notification.show}
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(prev => ({...prev, show: false}))}
            />
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
                                className={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm...')}
                                value={filters.type}
                                onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}>
                                <option value="">All Types</option>
                                <option value="image">Images</option>
                                <option value="video">Videos</option>
                                <option value="music">Audio</option>
                            </select>
                            <select
                                className={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm...')}
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}>
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="archived">Archived</option>
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
                                <Tooltip content="Grid View">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm" onClick={() => setViewMode('grid')}
                                        className="rounded-r-none">
                                        <Grid className="w-4 h-4"/>
                                    </Button>
                                </Tooltip>
                                {isClientDashboard && <Tooltip content="List View">
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm" onClick={() => setViewMode('list')}
                                        className="rounded-l-none border-l border-border">
                                        <List className="w-4 h-4"/>
                                    </Button>
                                </Tooltip>}
                                {showGrouping && <Tooltip content="Group by Location">
                                    <Button
                                        variant={viewMode === 'location' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('location')}
                                        className="rounded-l-none border-l border-border">
                                        <MapPin className="w-4 h-4"/>
                                    </Button>
                                </Tooltip>}
                                {showGrouping && <Tooltip content="Group by Company">
                                    <Button
                                        variant={viewMode === 'company' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('company')}
                                        className="rounded-l-none border-l border-border">
                                        <Folder className="w-4 h-4"/>
                                    </Button>
                                </Tooltip>}
                            </div>
                            <div className="flex gap-1">
                                <Tooltip content="Sort by Date">
                                    <Button variant={sort.field === 'created_at' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleSort('created_at')}>
                                        <Calendar className="w-4 h-4 mr-1"/>{sort.field === 'created_at'
                                        && (sort.direction === 'asc' ? <SortAsc className="w-3 h-3 ml-1"/> :
                                            <SortDesc className="w-3 h-3 ml-1"/>)}
                                    </Button>
                                </Tooltip>
                                <Tooltip content="Sort by Name">
                                    <Button variant={sort.field === 'title' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleSort('title')}>A-Z {sort.field === 'title'
                                        && (sort.direction === 'asc'
                                            ? <SortAsc className="w-3 h-3 ml-1"/> :
                                            <SortDesc className="w-3 h-3 ml-1"/>)}
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {processedContent.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
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
                            {paginatedContent.map(item => isClientDashboard ? (
                                <ContentCard
                                    key={item.id}
                                    item={item}
                                    isSelected={false}
                                    onSelectItem={() => {
                                    }}
                                    onViewDetails={() => setSelectedContent(item)}
                                    isAdminView={isAdminView}
                                    onDeleteItem={handleDeleteRequest}
                                />
                            ) : (
                                <AdminContentCard
                                    key={item.id}
                                    item={item}
                                    onClick={() => setSelectedContent(item)}
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
                                        <th className="p-4 font-medium text-left text-foreground">
                                            Content
                                        </th>
                                        <th className="p-4 font-medium text-left text-foreground">
                                            Store
                                        </th>
                                        <th className="p-4 font-medium text-left text-foreground">
                                            Status
                                        </th>
                                        <th className="p-4 font-medium text-left text-foreground">
                                            Size
                                        </th>
                                        <th className="p-4 font-medium text-left text-foreground">
                                            Uploaded
                                        </th>
                                        <th className="p-4 font-medium text-left text-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>{paginatedContent.map(item => {
                                        const Icon = getTypeIcon(item.type);
                                        return (
                                        <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="p-4">
                                                <Tooltip position="right"
                                                         content={<ContentPreviewTooltip
                                                             item={item}/>}>
                                                    <div className="flex items-center gap-3 cursor-default">
                                                        <Icon className="w-4 h-4" />
                                                        <div>
                                                            <p className="font-medium text-foreground">{item.title}</p>
                                                            <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                                                        </div>
                                                    </div>
                                                </Tooltip></td>
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
                                                    <Tooltip content="View details">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setSelectedContent(item)}>
                                                            <Eye className="w-4 h-4"
                                                            />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip content="Delete Content">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => handleDeleteRequest(item)}
                                                        >
                                                            <Delete className="w-4 h-4"/>
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}</tbody>
                                </table>
                            </div>
                        </CardContent
                        ></Card>
                    )}

                    {(viewMode === 'location' || viewMode === 'company') && showGrouping && (
                        <div
                            className="space-y-6">{Object.entries(groupedContent).map(([primaryKey, secondaryGroups]) => (
                            <Card key={primaryKey}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Folder className="w-5 h-5"/>
                                        {primaryKey}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {Object.entries(secondaryGroups).map(([secondaryKey, typeGroups]) => (
                                            <div key={secondaryKey} className="border-l-2 border-border pl-4">
                                                <h4 className="font-medium text-foreground mb-4">{secondaryKey}</h4>
                                                <div
                                                    className="space-y-6">{Object.entries(typeGroups).map(([type, items]) => {
                                                        const Icon = getTypeIcon(type as ContentItem['type']);
                                                        return (
                                                    <div key={type}>
                                                        <div
                                                            className="flex items-center gap-2 text-md font-semibold text-foreground mb-3">
                                                            <Icon className="w-4 h-4" />
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
                                                )})}</div>
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

            {/* --- NEW: Add the confirmation modal for deleting content --- */}
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
