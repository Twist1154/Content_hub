
// src/lib/types.ts

export type ViewMode = 'grid' | 'list';
export type GroupingMode = 'company' | 'store' | 'none';

export interface ContentItem {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    createdAt: string;
    // Admin-specific fields
    userId?: string;
    userEmail?: string;
    companyName?: string;
    storeName?: string;
}
