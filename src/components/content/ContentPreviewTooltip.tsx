// src/components/content/ContentPreviewTooltip.tsx
import Image from 'next/image';
import { Video, Music, FileText } from 'lucide-react';
import type { ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ContentPreviewTooltipProps {
    item: ContentItem;
    className?: string;
}

export function ContentPreviewTooltip({ item, className }: ContentPreviewTooltipProps) {
    return (
        <div className={cn("w-64 p-0", className)}>
            {item.type === 'image' && (
                <div className="relative aspect-video">
                    <Image
                        src={item.file_url}
                        alt={item.title}
                        fill
                        className="object-cover rounded-md"
                        sizes="256px"
                    />
                </div>
            )}
            {item.type === 'video' && (
                <div className="aspect-video bg-black rounded-md flex items-center justify-center">
                    <Video className="w-16 h-16 text-white/70" />
                </div>
            )}
            {item.type === 'audio' && (
                <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 rounded-md flex items-center justify-center">
                    <Music className="w-16 h-16 text-white" />
                </div>
            )}
            {(item.type === 'document' || item.type === 'other') && (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <FileText className="w-16 h-16 text-muted-foreground" />
                </div>
            )}
            <div className="p-2">
                <p className="font-semibold text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
            </div>
        </div>
    );
}
