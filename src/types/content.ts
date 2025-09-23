// components/types/content.ts

/**
 * Defines the possible types for a piece of content.
 */
export type ContentType = 'image' | 'video' | 'music';

/**
 * Statistics about content counts used across dashboards.
 * Keep this in sync with app/actions/data-actions.ts
 */
export interface ContentStats {
    total: number;
    active: number;
    scheduled: number;
    thisMonth: number;
}

/**
 * Minimal Store shape used by client components.
 * Additional fields may exist in the database, but these are the ones referenced in UI code.
 */
export interface Store {
    id: string;
    name: string;
    brand_company: string;
    address: string;
}

/**
 * Represents a single piece of content within the system.
 * This interface is the single source of truth for content-related data,
 * combining all necessary fields from various components like ContentViewer and BulkDownloadManager.
 */
export interface ContentItem {
    // === Core Fields ===
    id: string;
    title: string;
    type: ContentType;
    created_at: string; // Should be an ISO 8601 date string, e.g., "2023-10-27T10:00:00Z"

    // === File-specific Fields ===
    file_url: string;
    file_size: number; // Stored in bytes

    // === Scheduling Fields (from ContentViewer) ===
    // These are marked as optional because they may not be present in all data fetches,
    // such as in the initial version of BulkDownloadManager.
    start_date?: string;
    end_date?: string;
    recurrence_type?: string; // e.g., 'Daily', 'Weekly', 'None'
    recurrence_days?: string[] | null;

    // === Relational Data (Nested Objects) ===
    // Marked as optional to prevent errors if the data is not joined in a specific query.

    /**
     * Information about the store associated with the content.
     */
    stores?: {
        name: string;
        brand_company: string;
        address: string;
    };

    /**
     * Information about the user/profile that uploaded the content.
     */
    profiles?: {
        email: string;
    };
}
