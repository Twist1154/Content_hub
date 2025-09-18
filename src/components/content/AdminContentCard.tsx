
// src/components/content/AdminContentCard.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FileIcon from '@/components/file-icon';
import { formatBytes, cn } from '@/lib/utils';
import type { ContentItem, ViewMode } from '@/lib/types';
import { Building, Store, User } from 'lucide-react';
import Image from 'next/image';

interface AdminContentCardProps {
    item: ContentItem;
    viewMode: ViewMode;
}

export function AdminContentCard({ item, viewMode }: AdminContentCardProps) {
    const isListView = viewMode === 'list';
    const isImage = item.type.startsWith('image/');

    return (
        <Card className={cn(
            "flex transition-all hover:shadow-md",
            isListView ? "flex-row items-center" : "flex-col"
        )}>
            <CardHeader className={cn(
                "relative p-0",
                isListView ? "w-24 h-24 flex-shrink-0" : "h-40"
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
                        <FileIcon fileType={item.type} className="w-10 h-10 text-muted-foreground" />
                    </div>
                )}
            </CardHeader>
            <div className="flex flex-col flex-grow">
                <CardContent className={cn("flex-grow", isListView ? "p-3" : "p-4")}>
                    <CardTitle className="text-base font-semibold leading-tight truncate mb-2">{item.name}</CardTitle>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5" />
                            <span>{item.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building className="w-3.5 h-3.5" />
                            <span>{item.companyName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Store className="w-3.5 h-3.5" />
                            <span>{item.storeName}</span>
                        </div>
                    </div>
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
