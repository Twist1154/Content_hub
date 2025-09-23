// src/lib/content-utils.tsx
import { Badge } from "@/components/ui/Badge";
import type { ContentItem, ContentType } from "../types/content";
import { File, Video, Music, Image as ImageIcon, Book } from "lucide-react";

export function formatFileSize(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getStatusBadge(item: ContentItem) {
    const statusMap = {
        active: { variant: 'default', className: 'bg-green-500/80 text-white', label: 'Active' },
        archived: { variant: 'secondary', label: 'Archived' },
        draft: { variant: 'outline', label: 'Draft' },
        scheduled: { variant: 'default', className: 'bg-blue-500/80 text-white', label: 'Scheduled' },
    };

    const { variant, className, label } = statusMap[item.status] || statusMap.draft;
    
    return <Badge variant={variant as any} className={className}>{label}</Badge>;
}

export function getTypeIcon(type: ContentType) {
    switch (type) {
        case 'image':
            return ImageIcon;
        case 'video':
            return Video;
        case 'audio':
            return Music;
        case 'document':
            return Book;
        default:
            return File;
    }
}
