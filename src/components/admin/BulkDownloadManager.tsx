// components/admin/BulkDownloadManager.tsx
'use client';

import {useCallback, useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {Input} from '@/components/ui/Input';
import {Tooltip} from '@/components/ui/Tooltip';
import {Badge} from '@/components/ui/Badge';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {Archive, Filter, FileArchive} from 'lucide-react';
import {format} from 'date-fns';
import {fetchAllContent} from '@/app/actions/data-actions';
import {ContentCard} from '@/components/content/ContentCard';
import type {ContentItem} from '@/lib/types';
import {ContentDetailModal} from "@/components/content/ContentDetailModal";
import {formatFileSize} from "@/lib/content-utils";
import {cn} from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FilterOptions {
    startDate: string;
    endDate: string;
    contentType: string;
    client: string;
    company: string;
}

export function BulkDownloadManager() {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        startDate: '',
        endDate: '',
        contentType: '',
        client: '',
        company: '',
    });

    const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);
    const { toast } = useToast();

    const fetchContentCb = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchAllContent();
            if (result.success && result.content) {
                const sanitizedContent = result.content.map(item => ({
                    ...item,
                    start_date: item.start_date || new Date().toISOString(),
                    end_date: item.end_date || new Date().toISOString(),
                }));
                setContent(sanitizedContent);
            } else {
                throw new Error(result.error || 'Failed to fetch content');
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            toast({
                variant: 'destructive',
                title: 'Failed to load content',
                description: error instanceof Error ? error.message : 'An unknown error occurred.',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const applyFilters = useCallback(() => {
        let filtered = [...content];

        if (filters.startDate) {
            filtered = filtered.filter(item =>
                new Date(item.created_at) >= new Date(filters.startDate)
            );
        }

        if (filters.endDate) {
            filtered = filtered.filter(item =>
                new Date(item.created_at) <= new Date(filters.endDate)
            );
        }

        if (filters.contentType) {
            filtered = filtered.filter(item => item.type === filters.contentType);
        }

        if (filters.client) {
            filtered = filtered.filter(item =>
                item.user_email?.toLowerCase().includes(filters.client.toLowerCase())
            );
        }

        if (filters.company) {
            filtered = filtered.filter(item =>
                item.stores?.brand_company?.toLowerCase().includes(filters.company.toLowerCase())
            );
        }

        setFilteredContent(filtered);
        setSelectedItems(new Set()); // Clear selection when filters change
    }, [content, filters]);

    useEffect(() => {
        fetchContentCb();
    }, [fetchContentCb]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const toggleSelectAll = () => {
        if (selectedItems.size === filteredContent.length && filteredContent.length > 0) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredContent.map(item => item.id)));
        }
    };

    const toggleSelectItem = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const downloadSelected = async () => {
        if (selectedItems.size === 0) return;
        setDownloading(true);

        try {
            const selectedContent = filteredContent.filter(item => selectedItems.has(item.id));
            const fileUrls = selectedContent.map(item => item.file_url).filter(Boolean);

            if (fileUrls.length === 0) {
                toast({
                    variant: 'destructive',
                    title: 'No Files to Download',
                    description: 'The selected items do not have any downloadable files.',
                });
                return;
            }

            const response = await fetch('/api/download-zip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileUrls }),
            });

            if (!response.ok) {
                 try {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Server responded with status ${response.status}`);
                } catch (e) {
                    // If parsing JSON fails, fall back to a generic error.
                    throw new Error(`Failed to download files. Server responded with status ${response.status}.`);
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `content-archive-${format(new Date(), 'yyyy-MM-dd')}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            toast({
                title: 'Download Started',
                description: 'Your ZIP archive is being downloaded.',
            });

        } catch (error) {
            console.error('Error downloading content:', error);
            toast({
                variant: 'destructive',
                title: 'Download Failed',
                description: error instanceof Error ? error.message : 'An unknown error occurred during download.',
            });
        } finally {
            setDownloading(false);
        }
    };


    const getTotalSize = () => {
        const selectedContent = filteredContent.filter(item => selectedItems.has(item.id));
        const totalBytes = selectedContent.reduce((sum, item) => sum + item.file_size, 0);
        return formatFileSize(totalBytes);
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <LoadingSpinner size="lg" text="Loading all content..."/>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5"/>
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">Start Date</label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) =>
                                    setFilters(prev => ({...prev, startDate: e.target.value}))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">End Date</label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) =>
                                    setFilters(prev => ({...prev, endDate: e.target.value}))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">Content Type</label>
                            <select
                                className={cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1')}
                                value={filters.contentType} onChange={(e) =>
                                setFilters(prev => ({...prev, contentType: e.target.value}))}
                            >
                                <option value="">All Types</option>
                                <option value="image">Images</option>
                                <option value="video">Videos</option>
                                <option value="audio">Audio</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">
                                Client Email
                            </label>
                            <Input
                                placeholder="Search by email..."
                                value={filters.client} onChange={(e) =>
                                setFilters(prev => ({...prev, client: e.target.value}))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">Company</label>
                            <Input
                                placeholder="Search by company..."
                                value={filters.company}
                                onChange={(e) =>
                                    setFilters(prev => ({...prev, company: e.target.value}))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-4 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.size === filteredContent.length && filteredContent.length > 0}
                                    onChange={toggleSelectAll}
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-foreground">
                  Select All ({filteredContent.length} items)
                </span>
                            </label>
                            {selectedItems.size > 0 && (
                                <Badge variant="secondary">
                                    {selectedItems.size} selected • {getTotalSize()}
                                </Badge>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Tooltip content="Clear all filters">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilters({
                                        startDate: '',
                                        endDate: '',
                                        contentType: '',
                                        client: '',
                                        company: ''
                                    })}>
                                    Clear Filters
                                </Button>
                            </Tooltip>
                            <Tooltip content="Download selected files as a ZIP archive">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={downloadSelected}
                                    disabled={selectedItems.size === 0 || downloading}
                                >
                                    <FileArchive className="w-4 h-4 mr-2"/>
                                    {downloading ?
                                        <LoadingSpinner size="sm"/> : `Download Zip (${selectedItems.size})`}
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredContent.map(item => (
                    <ContentCard
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.has(item.id)}
                        onSelectItem={toggleSelectItem}
                        onViewDetails={() => setViewingItem(item)}
                    />
                ))}
            </div>

            {filteredContent.length === 0 && !loading && (
                <Card>
                    <CardContent className="text-center py-12">
                        <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                        <h3 className="text-lg font-medium text-foreground mb-2">No content found</h3>
                        <p className="text-muted-foreground">
                            Try adjusting your filters to see more content.
                        </p>
                    </CardContent>
                </Card>
            )}

            <ContentDetailModal item={viewingItem} onClose={() => setViewingItem(null)}/>
        </div>
    );
}
