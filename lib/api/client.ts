/**
 * API Client - PLYAZ League Manager
 * Base configuration and utilities for API calls
 */

import type { ApiResponse, ApiError } from '@/types';

import { LocalStore } from '@/lib/mock/store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Simulation Mode Check
const isSimulationMode = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('plyaz_simulation_enabled') === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL;
};

/**
 * Mock Handler for Simulation Mode
 * Intercepts API calls and routes them to LocalStore
 */
const mockHandler = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    console.log(`[SIMULATION] Intercepting ${options.method || 'GET'} ${endpoint}`);

    // Artificial latency
    await new Promise(resolve => setTimeout(resolve, 300));

    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : null;

    // Competition Endpoints
    if (endpoint.includes('/api/league/competitions')) {
        const idMatch = endpoint.match(/\/competitions\/([^\/]+)/);
        const compId = idMatch ? idMatch[1] : null;

        if (method === 'GET') {
            if (compId) {
                if (endpoint.includes('/standings')) {
                    // TODO: Compute real standings from matches? For now, return mock.
                    return { data: LocalStore.get('standings').filter((s: any) => s.competitionId === compId) };
                }
                return LocalStore.findOne('competitions', (c: any) => c.id === compId);
            }
            return LocalStore.get('competitions');
        }

        if (method === 'POST') {
            return LocalStore.addItem('competitions', { ...body, status: 'draft' });
        }
    }

    // Team Endpoints
    if (endpoint.includes('/api/league/teams')) {
        if (method === 'GET') return LocalStore.get('teams');
        if (method === 'POST') return LocalStore.addItem('teams', body);
    }

    // Match Endpoints
    if (endpoint.includes('/api/league/matches')) {
        if (method === 'GET') return LocalStore.get('matches');
        if (method === 'POST') return LocalStore.addItem('matches', { ...body, status: 'scheduled' });
    }

    // Profile / Org Endpoints
    if (endpoint.includes('/api/league/organizations')) {
        if (method === 'GET') return LocalStore.findOne('organizations', () => true);
    }

    // Default Fallback
    const key = endpoint.split('/').pop() || 'unknown';
    if (method === 'GET') return LocalStore.get(key);

    return { success: true, message: 'Simulated operation successful' };
};

/**
 * Custom error class for API errors
 */
export class ApiException extends Error {
    code: string;
    details?: Record<string, unknown>;

    constructor(error: ApiError) {
        super(error.message);
        this.name = 'ApiException';
        this.code = error.code;
        this.details = error.details;
    }
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    // Check for Simulation Mode
    if (isSimulationMode() && endpoint.startsWith('/api')) {
        return mockHandler(endpoint, options) as Promise<T>;
    }

    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        let errorData: ApiError;
        try {
            errorData = await response.json();
        } catch {
            errorData = {
                code: 'UNKNOWN_ERROR',
                message: `HTTP ${response.status}: ${response.statusText}`,
            };
        }
        throw new ApiException(errorData);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

/**
 * API request methods
 */
export const apiClient = {
    get: <T>(endpoint: string, options?: RequestInit) =>
        apiFetch<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
        apiFetch<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }),

    put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
        apiFetch<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }),

    patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
        apiFetch<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T>(endpoint: string, options?: RequestInit) =>
        apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
