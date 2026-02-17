# Supabase Integration Architecture

This document describes the refactored Supabase integration architecture in PLYAZ, designed for stability, type safety, and maintainability.

## Core Principles

1.  **Centralized Clients**: Standardized Supabase clients for browser and server environments.
2.  **Services Layer**: Encapsulation of all Supabase interactions within a services layer (`@/services/*`).
3.  **Type Safety**: Shared `Database` types from Supabase CLI, refined for application-specific needs.
4.  **Data Mapping**: Seamless conversion between database (snake_case) and UI (camelCase) naming conventions.
5.  **React Query Integration**: Hooks consume services for unified data access and caching logic.

## Directory Structure

```text
lib/
  supabase/
    client.ts     # Standardized browser client
    server.ts     # Standardized server client (for Route Handlers/Actions)
    types.ts      # Generated/Refined database types
services/
  auth.ts         # User authentication & session management
  org.ts          # Organization & competition management
  team.ts         # Team operations
  player.ts       # Player operations
  match.ts        # Match operations & live updates
lib/hooks/
  useQueries.ts   # React Query hooks consuming the services layer
```

## Data Access Pattern

All data fetching and mutations should follow this flow:

1.  **UI Component**: Calls a React Query hook (e.g., `useMatches`).
2.  **Hook**: Executes a service method (e.g., `matchService.getMatches`).
3.  **Service**:
    *   Initializes the Supabase client.
    *   Executes the database query.
    *   Maps the results from snake_case to camelCase using a dedicated `map` helper.
    *   Returns the cleaned data.
4.  **UI**: Receives type-safe, camelCase data ready for display.

### Example Service Implementation

```typescript
// services/match.ts
export const matchService = {
  mapMatch(match: any) {
    return {
      ...match,
      homeScore: match.home_score,
      awayScore: match.away_score,
      // ...
    };
  },

  async getMatches(params) {
    const supabase = createClient();
    const { data, error } = await supabase.from('matches').select('*');
    if (error) throw error;
    return data.map(this.mapMatch);
  }
};
```

## Security

*   **Row Level Security (RLS)**: Enabled on all tables. Policies ensure users can only access data within their own organization or public competitions.
*   **Triggers**: Database triggers maintain secondary tables (e.g., `profiles`, `standings`) to ensure data consistency without manual intervention.

## Debugging

A dedicated debug dashboard is available at `/debug/supabase` (development only) to verify:
*   Supabase environment variables.
*   Session status.
*   Database connectivity & query execution.
