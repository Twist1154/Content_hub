
// src/components/content/ClientContentCard.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FileIcon from '@/components/FileIcon';
import { formatBytes, cn } from '@/lib/utils';
import type { ContentItem, ViewMode } from '@/lib/types';
import Image from 'next/image';

interface ClientContentCardProps {
    item: ContentItem;
    viewMode: ViewMode;
}

export function ClientContentCard({ item, viewMode }: ClientContentCardProps) {
    const isListView = viewMode === 'list';
    const isImage = item.type.startsWith('image/');

    return (
        <Card className={cn(
            "flex transition-all hover:shadow-md",
            isListView ? "flex-row items-center" : "flex-col"
        )}>
            <CardHeader className={cn(
                "relative p-0",
                isListView ? "w-20 h-20 flex-shrink-0" : "h-32"
            )}>
                 {isImage ? (
                    <Image
                        src={item.url}
                        alt={item.name}
                        fill
                        className={cn(
                            "object-cover",
                            isListView ? "rounded-l-lg" : "rounded-t-lg"
                        )}
                    />
                ) : (
                    <div className={cn(
                        "flex items-center justify-center h-full bg-secondary",
                        isListView ? "rounded-l-lg" : "rounded-t-lg"
                    )}>
                        <FileIcon fileType={item.type} className="w-8 h-8 text-muted-foreground" />
                    </div>
                )}
            </CardHeader>
            <div className="flex flex-col flex-grow min-w-0">
                <CardContent className={cn("flex-grow", isListView ? "p-3" : "p-4")}>
                    <CardTitle className="text-sm font-medium leading-tight truncate">{item.name}</CardTitle>
                </CardContent>
                <CardFooter className={cn(
                    "flex justify-between items-center text-xs text-muted-foreground",
                     isListView ? "p-3 pt-0" : "p-4 pt-0"
                )}>
                    <span>{formatBytes(item.size)}</span>
                    <Badge variant="outline" className="capitalize">{item.type.split('/')[1] || 'File'}</Badge>
                </CardFooter>
            </div>
        </Card>
    );
}
