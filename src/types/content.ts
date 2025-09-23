// /types/content.ts

/**
 * =================================================================
 *  Core Content & Data Model Definitions
 *  This file is the single source of truth for all content-related types.
 * =================================================================
 */

// --- ENUMERATED TYPES ---

/**
 * Defines the possible display modes for content galleries.
 */
export type ViewMode = 'grid' | 'list';

/**
 * Defines the criteria for grouping content in the UI.
 */
export type GroupingMode = 'company' | 'store' | 'none';

/**
 * Defines the lifecycle status of a piece of content.
 * This is used to determine if content is live, planned, or inactive.
 */
export type ContentStatus = 'active' | 'scheduled' | 'archived' | 'draft';

/**
 * Defines the possible types for a piece of content.
 * 'audio' is used as the standard for all sound files.
 */
export type ContentType = 'image' | 'video' | 'audio' | 'music' | 'document' | 'other';


// --- INTERFACE DEFINITIONS ---

/**
 * Represents a Store or location.
 * Merged from both definitions to create a complete shape.
 */
export interface Store {
    id: string;
    user_id: string; // The owner/creator of the store
    name: string;
    brand_company: string;
    address: string;
    created_at: string; // ISO 8601 date string
}

/**
 * Represents a marketing Campaign.
 */
export interface Campaign {
    name: string;
    start_date: string; // ISO 8601 date string
    end_date: string;   // ISO 8601 date string
}

/**
 * Represents a single piece of content within the system.
 * This is a unified interface combining fields from all previous definitions.
 * It serves as the single source of truth for content objects.
 */
export interface ContentItem {
    // --- Core Fields ---
    id: string;
    title: string;
    type: ContentType;
    status: ContentStatus;
    created_at: string; // ISO 8601 date string, e.g., "2023-10-27T10:00:00Z"

    // --- File-specific Fields ---
    file_url: string;
    file_size: number; // Stored in bytes

    // --- Scheduling Fields ---
    start_date?: string | null; // The date the content becomes active
    end_date?: string | null;   // The date the content expires
    recurrence_type?: 'Daily' | 'Weekly' | 'None' | null;
    recurrence_days?: string[] | null; // e.g., ['Monday', 'Wednesday']

    // --- Relational & Joined Data ---
    // These fields are optional as they depend on the specific database query.

    /**
     * The user who uploaded the content.
     */
    user_id?: string;
    user_email?: string;

    /**
     * The store associated with this content.
     * Can be null if not linked to a specific store.
     */
    stores?: Store | null;

    /**
     * The campaign this content is a part of.
     * Can be null if not part of a campaign.
     */
    campaigns?: Campaign | null;
}

/**
 * Represents a Client user and their associated data.
 */
export interface Client {
    id: string;
    email: string;
    role: 'client';
    created_at: string;
    /**
     * A list of stores associated with this client.
     */
    stores: Pick<Store, 'id' | 'name' | 'brand_company'>[];
    content_count: number;
    latest_upload: string | null; // ISO 8601 date string
}


// --- DASHBOARD & STATISTICS TYPES ---

/**
 * Statistics about content counts used across dashboards.
 */
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