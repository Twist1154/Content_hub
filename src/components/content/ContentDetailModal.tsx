// components/content/ContentDetailModal.tsx


'use client';

import {useEffect, useRef} from 'react';
import Image from 'next/image';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Download, ExternalLink, FileText, Image as ImageIcon, Music, Video,X} from 'lucide-react';
import {format} from 'date-fns';
import type {ContentItem} from '@/lib/types';

interface ContentDetailModalProps {
    item: ContentItem | null;
    onClose: () => void;
}

// These utilities are kept here to perfectly match the original component's implementation.
// For a larger app, they would live in a shared `utils` file.
const getTypeIcon = (type: string) => {
    switch (type) {
        case 'image':
            return <ImageIcon className="w-4 h-4" />;
        case 'video':
            return <Video className="w-4 h-4" />;
        case 'audio':
            return <Music className="w-4 h-4" />;
        default:
            return <FileText className="w-4 h-4" />;
    }
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export function ContentDetailModal({item, onClose}: ContentDetailModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Effect to handle clicks outside the modal to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (item) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [item, onClose]);

    if (!item) {
        return null;
    }

    return (
        // The backdrop is universal and does not need theming.
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0">

            {/* The Card component is already themed from our previous fix. */}
            <Card ref={modalRef} className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            {item.title}
                        </CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8" // A slightly smaller size for a modal close button
                                        onClick={onClose}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Close details</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">

                    {/* Section 1: Metadata Grid */}
                    {/* THEME: Used `text-muted-foreground` for the text to ensure readability in both themes. */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                        <div className="truncate"><strong className="text-foreground">Store:</strong> {item.stores?.name || 'N/A'}</div>
                        <div className="truncate"><strong className="text-foreground">Company:</strong> {item.stores?.brand_company || 'N/A'}</div>
                        <div><strong className="text-foreground">Type:</strong> <span className="capitalize">{item.type}</span></div>
                        <div><strong className="text-foreground">Size:</strong> {formatFileSize(item.file_size)}</div>
                        <div><strong className="text-foreground">Uploaded By:</strong> {item.user_email || 'N/A'}</div>
                        <div><strong className="text-foreground">Uploaded:</strong> {format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}</div>
                    </div>

                    {/* Section 4: Action Buttons */}
                    {/* The Button components are already themed and need no changes. */}
                    <div className="flex gap-2 pt-4 border-t border-border">
                        <Button
                            onClick={() => window.open(item.file_url, '_blank')}
                            className="flex-1"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download File
                        </Button>
                        <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => window.open(item.file_url, '_blank')}
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Open file in new tab</p>
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Section 5: Media Preview */}
                    {/* The media elements (image, video, audio) are universal and do not require theming. */}
                    {(item.type === 'image' || item.type === 'video' || item.type === 'audio') && (
                        <div className="mt-4 border-t border-border pt-4">
                    {item.type === 'image' && (
                                <div className="relative w-full h-auto bg-muted/30 rounded" style={{ aspectRatio: '16/9' }}>
                                <Image
                                    src={item.file_url}
                                    alt={item.title}
                                    fill
                                        className="object-contain"
                                    sizes="(max-width: 640px) 90vw, 50vw"
                                />
                        </div>
                    )}
                    {item.type === 'video' && (
                                <video src={item.file_url} controls className="max-w-full h-auto rounded" />
                    )}
                    {item.type === 'audio' && (
                                <audio src={item.file_url} controls className="w-full" />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
