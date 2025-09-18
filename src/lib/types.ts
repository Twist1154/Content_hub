
// src/lib/types.ts

export type ViewMode = 'grid' | 'list';
export type GroupingMode = 'company' | 'store' | 'none';

export type ContentStatus = 'active' | 'archived' | 'draft' | 'scheduled';
export type ContentType = 'image' | 'video' | 'audio' | 'document' | 'other';


export interface ContentItem {
    id: string;
    title: string;
    file_url: string;
    type: ContentType;
    file_size: number;
    created_at: string;
    status: ContentStatus;
    user_id?: string;
    user_email?: string;
    stores?: {
        name: string;
        brand_company: string;
    } | null;
    campaigns?: {
        name: string;
        start_date: string;
        end_date: string;
    } | null;
}
