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

    const PreviewContainer = ({ children }: { children: React.ReactNode }) => (
        <div className="w-48 h-auto bg-popover rounded-md overflow-hidden border border-border">
            {children}
        </div>
    );

    switch (item.type) {
        case 'image':
            return (
                <PreviewContainer>
                    <div className="relative aspect-video">
                        <Image
                            src={item.file_url}
                            alt={`Preview of ${item.title}`}
                            fill
                            className="object-cover"
                            sizes="12rem" // 192px
                        />
                    </div>
                </PreviewContainer>
            );

        case 'video':
            return (
                <PreviewContainer>
                    <div className="relative aspect-video w-full h-full flex items-center justify-center bg-black/50">
                        <video
                            src={item.file_url}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                            muted
                            autoPlay
                            loop
                            playsInline
                        />
                        <Video className="w-8 h-8 text-popover-foreground/70 z-10" />
                    </div>
                </PreviewContainer>
            );

        case 'audio':
            return (
                <div className="p-3 w-48 bg-popover rounded-md border border-border">
                    <div className='flex items-center gap-2 mb-2'>
                        <Music className="w-4 h-4 text-primary" />
                        <p className="text-popover-foreground text-sm font-semibold line-clamp-1">{item.title}</p>
                    </div>
                    <audio src={item.file_url} controls className="w-full h-8" />
                </div>
            );

        default:
            return (
                <div className="p-3 w-48 text-sm text-muted-foreground">
                    No preview available.
                </div>
            );
    }
}
