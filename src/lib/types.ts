
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
        address?: string;
    } | null;
    campaigns?: {
        name: string;
        start_date: string;
        end_date: string;
    } | null;
}

export interface Store {
    id: string;
    user_id: string;
    name: string;
    brand_company: string;
    address: string;
    created_at: string;
}

export interface ContentStats {
    total: number;
    active: number;
    scheduled: number;
    thisMonth: number;
}

export interface Client {
    id: string;
    email: string;
    role: 'client';
    created_at: string;
    stores: {
        id: string;
        name: string;
        brand_company: string;
    }[];
    content_count: number;
    latest_upload: string | null;
}
