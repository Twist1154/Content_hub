// components/content/ContentCard.tsx

'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { CheckSquare, Square, ExternalLink, Video, Music, Trash2 } from 'lucide-react'; // --- NEW: Import Trash2 ---
import { cn } from '@/lib/utils';

// ---  these are now in a shared utils file ---
import { formatFileSize, getStatusBadge } from '@/lib/content-utils.tsx';
import { ContentItem } from '@/lib/types';

// --- NEW: Updated props to include admin functionality ---
interface ContentCardProps {
    item: ContentItem;
    isSelected: boolean;
    onSelectItem: (id: string) => void;
    onViewDetails: (item: ContentItem) => void;
    isAdminView?: boolean;
    onDeleteItem?: (item: ContentItem) => void;
}

export function ContentCard({
    item,
    isSelected,
    onSelectItem,
    onViewDetails,
    isAdminView = false, // --- NEW: Default to false ---
    onDeleteItem         // --- NEW: Added delete handler ---
}: ContentCardProps) {

    const handleCardClick = () => {
        onViewDetails(item);
    };

    const handleSelectClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectItem(item.id);
    };

    // --- NEW: Handler for the delete button ---
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (onDeleteItem) {
            onDeleteItem(item);
        }
    };

    return (
        <div
            className={cn(
                'relative bg-card text-card-foreground rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer',
                isSelected ? 'border-primary ring-2 ring-primary ring-offset-background ring-offset-1' : 'border-border'
            )}
            onClick={handleCardClick}
        >
            <div
                className="absolute top-2 left-2 z-20"
                onClick={handleSelectClick}
            >
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            {isSelected ? (
                                // THEME: The selected icon now uses the `primary` theme color.
                                <CheckSquare className="w-6 h-6 text-primary-foreground bg-primary rounded-md p-0.5" />
                            ) : (
                                // THEME: The unselected icon is styled to be subtle but visible in both themes.
                                <Square className="w-6 h-6 text-muted-foreground bg-background/70 backdrop-blur-sm rounded-md transition-colors group-hover:text-primary" />
                            )}
                        </TooltipTrigger>
                        <TooltipContent>
                            {isSelected ? 'Deselect' : 'Select'}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* --- MEDIA PREVIEW --- */}
            {/* THEME: 'bg-gray-100' becomes 'bg-muted' for the placeholder. */}
            <div className="relative aspect-video bg-muted overflow-hidden">
                {item.type === 'image' && (
                    <Image
                        src={item.file_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                )}
                {item.type === 'video' && (
                    // THEME: 'bg-black' is okay here as it's a universal 'video player' color,
                    // but using 'bg-foreground/10' might be a softer option. For now, we'll keep it.
                    <div className="w-full h-full flex items-center justify-center bg-black">
                        <Video className="w-12 h-12 text-white/70" />
                    </div>
                )}
                {item.type === 'audio' && (
                    // THEME: Kept the gradient as it is a specific design choice, not a theme issue. This is fine.
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                        <Music className="w-12 h-12 text-white" />
                    </div>
                )}

                {/* Hover overlay with actions */}
                {/* THEME: Changed overlay to use a semi-transparent foreground color for better theme adaptability. */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                View details
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Status badge */}
                <div className="absolute top-2 right-2 z-10">
                    {/* Assuming getStatusBadge() returns a themed <Badge> component, this is correct. */}
                    {getStatusBadge(item)}
                </div>
            </div>

            <div className="p-3">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm leading-tight">
                    {item.title}
                </h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="font-medium truncate text-foreground/80">{item.stores?.name ?? 'Unknown Store'}</p>
                    <p className="truncate">{item.stores?.brand_company ?? 'Unknown Company'}</p>
                    <p>{formatFileSize(item.file_size)}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                    {item.user_email && (
                        <span className="truncate" title={item.user_email}>
                           {item.user_email}
                        </span>
                    )}
                </div>

                {/* --- NEW: Conditionally rendered admin action bar --- */}
                {isAdminView && (
                    <div className="mt-2 pt-2 border-t border-border flex items-center justify-end">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={handleDeleteClick}
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete this content permanently</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </div>
        </div>
    );
}
