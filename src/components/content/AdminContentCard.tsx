// src/components/content/AdminContentCard.tsx
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ContentItem } from '@/lib/types';
import { getStatusBadge, formatFileSize, getTypeIcon } from '@/lib/content-utils.tsx';

interface AdminContentCardProps {
    item: ContentItem;
    onClick: (item: ContentItem) => void;
}

export function AdminContentCard({ item, onClick }: AdminContentCardProps) {
    const TypeIcon = getTypeIcon(item.type);

    return (
        <div
            className="bg-card text-card-foreground rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
            onClick={() => onClick(item)}
        >
            <div className="relative aspect-video bg-muted overflow-hidden">
                {item.type === 'image' && item.file_url ? (
                    <Image
                        src={item.file_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                ) : item.type === 'video' && item.file_url ? (
                     <div className="relative w-full h-full bg-black">
                        <video src={item.file_url} className="w-full h-full object-cover" muted preload="metadata" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <TypeIcon className="w-12 h-12 text-white/80" />
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                         <TypeIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                )}

                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onClick(item); }}>
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View details</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); window.open(item.file_url, '_blank'); }}>
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                     <p>Download file</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div className="absolute top-2 left-2"><Badge variant="secondary" className="text-xs capitalize">{item.type}</Badge></div>
                <div className="absolute top-2 right-2">{getStatusBadge(item)}</div>
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm">{item.title}</h3>
                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <p className="font-medium text-foreground/90">{item.stores?.name || 'N/A'}</p>
                    <p>{item.stores?.brand_company || 'N/A'}</p>
                    <p>{formatFileSize(item.file_size)}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                    <span className="capitalize">{item.type}</span>
                </div>
            </div>
        </div>
    );
}
