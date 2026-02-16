/**
 * API Response Types - PLYAZ League Manager
 * Additional types not covered by models.ts
 */

// ApiResponse, PaginatedResponse, ApiError are already in models.ts

export interface ActivityItem {
    id: string;
    action: string;
    detail: string;
    entity_type: 'match' | 'team' | 'player' | 'competition';
    entity_id: string;
    timestamp: string;
    user_id?: string;
}
