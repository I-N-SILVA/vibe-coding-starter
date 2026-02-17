/**
 * Enhanced Types - PLYAZ Multi-Tenant League Platform
 * Extended from original types to support full multi-tenant schema
 */

// ============================================
// CORE ENTITIES
// ============================================

export type Organization = {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
    logo_url: string | null;
    plan: 'free' | 'pro' | 'elite';
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    created_at: string;
    updated_at: string;
};

export type Profile = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: 'admin' | 'organizer' | 'referee' | 'manager' | 'player' | 'fan';
    organization_id: string | null;
    phone: string | null;
    bio: string | null;
    position: string | null;
    jersey_number: number | null;
    nationality: string | null;
    created_at: string;
    updated_at: string;
};

export type Competition = {
    id: string;
    organization_id: string;
    name: string;
    description: string | null;
    type: 'league' | 'knockout' | 'group_knockout';
    status: 'draft' | 'active' | 'completed' | 'archived';
    season: string | null;
    year: number | null;
    category_id: string | null;
    start_date: string | null;
    end_date: string | null;
    max_teams: number;
    rules: Record<string, unknown>;
    settings: Record<string, unknown>;
    invite_code: string | null;
    created_at: string;
    updated_at: string;
};

export type Team = {
    id: string;
    competition_id: string | null;
    organization_id: string;
    name: string;
    short_name: string | null;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    manager_id: string | null;
    invite_code: string | null;
    created_at: string;
    updated_at: string;
};

export type Player = {
    id: string;
    team_id: string | null;
    profile_id: string | null;
    organization_id: string;
    name: string;
    position: PlayerPosition | null;
    jersey_number: number | null;
    date_of_birth: string | null;
    nationality: string | null;
    photo_url: string | null;
    bio: string | null;
    status: 'active' | 'injured' | 'suspended' | 'released';
    stats: PlayerStats;
    created_at: string;
    updated_at: string;
};

export type PlayerPosition = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM' | 'LW' | 'RW' | 'ST' | 'CF';

export type PlayerStats = {
    goals: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
    appearances: number;
};

export type Match = {
    id: string;
    competition_id: string;
    organization_id: string;
    home_team_id: string;
    away_team_id: string;
    matchday: number | null;
    round: string | null;
    home_score: number;
    away_score: number;
    status: 'upcoming' | 'live' | 'completed' | 'postponed' | 'cancelled';
    match_time: string | null;
    venue: string | null;
    venue_id: string | null;
    group_id: string | null;
    referee_id: string | null;
    scheduled_at: string | null;
    started_at: string | null;
    ended_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    // Joined
    home_team?: Team;
    away_team?: Team;
    referee?: Profile;
};

export type MatchEvent = {
    id: string;
    match_id: string;
    type: 'goal' | 'own_goal' | 'penalty' | 'yellow_card' | 'red_card' | 'substitution' | 'injury' | 'var_review';
    team_id: string | null;
    player_id: string | null;
    player_name: string | null;
    minute: number | null;
    half: '1st' | '2nd' | 'ET1' | 'ET2' | 'penalties' | null;
    details: Record<string, unknown>;
    created_at: string;
};

export type StandingsEntry = {
    id: string;
    competition_id: string;
    team_id: string;
    group_id: string | null;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    points: number;
    form: string[];
    updated_at: string;
    // Joined
    team?: Team;
};

export type Invite = {
    id: string;
    organization_id: string;
    competition_id: string | null;
    team_id: string | null;
    type: 'team_join' | 'player_join' | 'referee_invite' | 'admin_invite';
    email: string | null;
    token: string;
    status: 'pending' | 'accepted' | 'expired' | 'revoked';
    expires_at: string;
    accepted_by: string | null;
    created_at: string;
};

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

export type CreateOrganizationDto = {
    name: string;
    slug: string;
};

export type CreateCompetitionDto = {
    name: string;
    description?: string;
    type: 'league' | 'knockout' | 'group_knockout';
    season?: string;
    start_date?: string;
    end_date?: string;
    max_teams?: number;
    rules?: Record<string, unknown>;
};

export type CreateTeamDto = {
    name: string;
    short_name?: string;
    competition_id?: string;
    primary_color?: string;
    secondary_color?: string;
};

export type CreatePlayerDto = {
    name: string;
    team_id?: string;
    position?: PlayerPosition;
    jersey_number?: number;
    date_of_birth?: string;
    nationality?: string;
    bio?: string;
};

export type CreateMatchDto = {
    competition_id: string;
    home_team_id: string;
    away_team_id: string;
    matchday?: number;
    round?: string;
    venue?: string;
    venue_id?: string;
    group_id?: string;
    scheduled_at?: string;
    referee_id?: string;
};

export type UpdateScoreDto = {
    matchId: string;
    homeScore: number;
    awayScore: number;
    status?: Match['status'];
};

export type CreateInviteDto = {
    type: Invite['type'];
    competition_id?: string;
    team_id?: string;
    email?: string;
};

// ============================================
// DERIVED TYPE ALIASES
// ============================================

export type MatchStatus = Match['status'];
export type MatchEventType = MatchEvent['type'];
export type CompetitionFormat = Competition['type'];

export type AddMatchEventDto = {
    match_id: string;
    type: MatchEventType;
    minute?: number;
    half?: MatchEvent['half'];
    player_id?: string;
    player_name?: string;
    team_id?: string;
    details?: Record<string, unknown>;
};

// ============================================
// CHAMPIONSHIP SYSTEM ENTITIES
// ============================================

export type Venue = {
    id: string;
    organization_id: string;
    name: string;
    address: string | null;
    city: string | null;
    capacity: number | null;
    surface_type: 'grass' | 'artificial' | 'indoor' | 'hybrid' | null;
    created_at: string;
    updated_at: string;
};

export type Category = {
    id: string;
    organization_id: string;
    name: string;
    description: string | null;
    min_age: number | null;
    max_age: number | null;
    created_at: string;
    updated_at: string;
};

export type ChampionshipConfig = {
    id: string;
    competition_id: string;
    format: 'round_robin' | 'knockout' | 'group_knockout';
    groups_count: number;
    teams_per_group: number;
    advance_count: number;
    has_gold_final: boolean;
    has_silver_final: boolean;
    has_third_place: boolean;
    points_win: number;
    points_draw: number;
    points_loss: number;
    match_duration_minutes: number;
    half_time_minutes: number;
    has_extra_time: boolean;
    extra_time_minutes: number;
    has_penalties: boolean;
    max_substitutions: number;
    custom_rules: Record<string, unknown>;
    created_at: string;
    updated_at: string;
};

export type Group = {
    id: string;
    competition_id: string;
    name: string;
    display_order: number;
    created_at: string;
};

export type GroupTeam = {
    id: string;
    group_id: string;
    team_id: string;
    seed: number | null;
};

export type CompetitionRegistration = {
    id: string;
    competition_id: string;
    player_id: string;
    team_id: string;
    organization_id: string;
    id_document_type: 'passport' | 'national_id' | 'birth_certificate' | 'other';
    id_document_number: string;
    full_name: string;
    date_of_birth: string;
    jersey_number: number | null;
    position: string | null;
    photo_url: string | null;
    custom_fields: Record<string, unknown>;
    status: 'pending' | 'approved' | 'rejected';
    registered_at: string;
};

export type CompetitionRegistrationField = {
    id: string;
    competition_id: string;
    field_name: string;
    field_type: 'text' | 'number' | 'date' | 'select' | 'file';
    is_required: boolean;
    options: unknown[];
    display_order: number;
    created_at: string;
};

export type PlayerCompetitionStats = {
    id: string;
    competition_id: string;
    player_id: string;
    team_id: string;
    games_played: number;
    goals: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
    minutes_played: number;
    clean_sheets: number;
    saves: number;
    goals_conceded: number;
    penalties_saved: number;
    updated_at: string;
};

// Championship DTOs
export type CreateVenueDto = {
    name: string;
    address?: string;
    city?: string;
    capacity?: number;
    surface_type?: Venue['surface_type'];
};

export type CreateCategoryDto = {
    name: string;
    description?: string;
    min_age?: number;
    max_age?: number;
};

export type CreateChampionshipConfigDto = Omit<ChampionshipConfig, 'id' | 'created_at' | 'updated_at'>;

export type CreateGroupDto = {
    competition_id: string;
    name: string;
    display_order?: number;
};

export type CreateRegistrationDto = {
    competition_id: string;
    player_id: string;
    team_id: string;
    id_document_type: CompetitionRegistration['id_document_type'];
    id_document_number: string;
    full_name: string;
    date_of_birth: string;
    jersey_number?: number;
    position?: string;
    custom_fields?: Record<string, unknown>;
};

// ============================================
// DATABASE TYPE (for Supabase client)
// ============================================

// ============================================
// DATABASE TYPE
// ============================================

export type Database = {
    public: {
        Tables: {
            organizations: {
                Row: Organization;
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    owner_id: string;
                    logo_url?: string | null;
                    plan?: 'free' | 'pro' | 'elite';
                    stripe_customer_id?: string | null;
                    stripe_subscription_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Organization>;
                Relationships: [
                    {
                        foreignKeyName: "organizations_owner_id_fkey";
                        columns: ["owner_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            profiles: {
                Row: Profile;
                Insert: {
                    id: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    role?: Profile['role'];
                    organization_id?: string | null;
                    phone?: string | null;
                    bio?: string | null;
                    position?: string | null;
                    jersey_number?: number | null;
                    nationality?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Profile>;
                Relationships: [
                    {
                        foreignKeyName: "profiles_organization_id_fkey";
                        columns: ["organization_id"];
                        isOneToOne: false;
                        referencedRelation: "organizations";
                        referencedColumns: ["id"];
                    }
                ];
            };
            competitions: {
                Row: Competition;
                Insert: {
                    id?: string;
                    organization_id: string;
                    name: string;
                    description?: string | null;
                    type: Competition['type'];
                    status?: Competition['status'];
                    season?: string | null;
                    year?: number | null;
                    category_id?: string | null;
                    start_date?: string | null;
                    end_date?: string | null;
                    max_teams?: number;
                    rules?: Record<string, unknown>;
                    settings?: Record<string, unknown>;
                    invite_code?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Competition>;
                Relationships: [
                    {
                        foreignKeyName: "competitions_organization_id_fkey";
                        columns: ["organization_id"];
                        isOneToOne: false;
                        referencedRelation: "organizations";
                        referencedColumns: ["id"];
                    }
                ];
            };
            teams: {
                Row: Team;
                Insert: {
                    id?: string;
                    competition_id?: string | null;
                    organization_id: string;
                    name: string;
                    short_name?: string | null;
                    logo_url?: string | null;
                    primary_color?: string;
                    secondary_color?: string;
                    manager_id?: string | null;
                    invite_code?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Team>;
                Relationships: [];
            };
            players: {
                Row: Player;
                Insert: {
                    id?: string;
                    team_id?: string | null;
                    profile_id?: string | null;
                    organization_id: string;
                    name: string;
                    position?: PlayerPosition | null;
                    jersey_number?: number | null;
                    date_of_birth?: string | null;
                    nationality?: string | null;
                    photo_url?: string | null;
                    bio?: string | null;
                    status?: Player['status'];
                    stats?: PlayerStats;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Player>;
                Relationships: [];
            };
            matches: {
                Row: Match;
                Insert: {
                    id?: string;
                    competition_id: string;
                    organization_id: string;
                    home_team_id: string;
                    away_team_id: string;
                    matchday?: number | null;
                    round?: string | null;
                    home_score?: number;
                    away_score?: number;
                    status?: Match['status'];
                    match_time?: string | null;
                    venue?: string | null;
                    venue_id?: string | null;
                    group_id?: string | null;
                    referee_id?: string | null;
                    scheduled_at?: string | null;
                    started_at?: string | null;
                    ended_at?: string | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Match>;
                Relationships: [
                    {
                        foreignKeyName: "matches_home_team_id_fkey";
                        columns: ["home_team_id"];
                        isOneToOne: false;
                        referencedRelation: "teams";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "matches_away_team_id_fkey";
                        columns: ["away_team_id"];
                        isOneToOne: false;
                        referencedRelation: "teams";
                        referencedColumns: ["id"];
                    }
                ];
            };
            match_events: {
                Row: MatchEvent;
                Insert: {
                    id?: string;
                    match_id: string;
                    type: MatchEventType;
                    team_id?: string | null;
                    player_id?: string | null;
                    player_name?: string | null;
                    minute?: number | null;
                    half?: MatchEvent['half'];
                    details?: Record<string, unknown>;
                    created_at?: string;
                };
                Update: Partial<MatchEvent>;
                Relationships: [
                    {
                        foreignKeyName: "match_events_match_id_fkey";
                        columns: ["match_id"];
                        isOneToOne: false;
                        referencedRelation: "matches";
                        referencedColumns: ["id"];
                    }
                ];
            };
            standings: {
                Row: StandingsEntry;
                Insert: {
                    id?: string;
                    competition_id: string;
                    team_id: string;
                    group_id?: string | null;
                    played?: number;
                    won?: number;
                    drawn?: number;
                    lost?: number;
                    goals_for?: number;
                    goals_against?: number;
                    points?: number;
                    form?: string[];
                    updated_at?: string;
                };
                Update: Partial<StandingsEntry>;
                Relationships: [];
            };
            invites: {
                Row: Invite;
                Insert: {
                    id?: string;
                    organization_id: string;
                    competition_id?: string | null;
                    team_id?: string | null;
                    type: Invite['type'];
                    email?: string | null;
                    token?: string;
                    status?: Invite['status'];
                    expires_at: string;
                    accepted_by?: string | null;
                    created_at?: string;
                };
                Update: Partial<Invite>;
                Relationships: [];
            };
            venues: {
                Row: Venue;
                Insert: {
                    id?: string;
                    organization_id: string;
                    name: string;
                    address?: string | null;
                    city?: string | null;
                    capacity?: number | null;
                    surface_type?: Venue['surface_type'];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Venue>;
                Relationships: [];
            };
            categories: {
                Row: Category;
                Insert: {
                    id?: string;
                    organization_id: string;
                    name: string;
                    description?: string | null;
                    min_age?: number | null;
                    max_age?: number | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Category>;
                Relationships: [];
            };
            championship_config: {
                Row: ChampionshipConfig;
                Insert: {
                    id?: string;
                    competition_id: string;
                    format?: ChampionshipConfig['format'];
                    groups_count?: number;
                    teams_per_group?: number;
                    advance_count?: number;
                    has_gold_final?: boolean;
                    has_silver_final?: boolean;
                    has_third_place?: boolean;
                    points_win?: number;
                    points_draw?: number;
                    points_loss?: number;
                    match_duration_minutes?: number;
                    half_time_minutes?: number;
                    has_extra_time?: boolean;
                    extra_time_minutes?: number;
                    has_penalties?: boolean;
                    max_substitutions?: number;
                    custom_rules?: Record<string, unknown>;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<ChampionshipConfig>;
                Relationships: [];
            };
            groups: {
                Row: Group;
                Insert: {
                    id?: string;
                    competition_id: string;
                    name: string;
                    display_order?: number;
                    created_at?: string;
                };
                Update: Partial<Group>;
                Relationships: [];
            };
            group_teams: {
                Row: GroupTeam;
                Insert: {
                    id?: string;
                    group_id: string;
                    team_id: string;
                    seed?: number | null;
                };
                Update: Partial<GroupTeam>;
                Relationships: [];
            };
            competition_registrations: {
                Row: CompetitionRegistration;
                Insert: {
                    id?: string;
                    competition_id: string;
                    player_id: string;
                    team_id: string;
                    organization_id: string;
                    id_document_type: CompetitionRegistration['id_document_type'];
                    id_document_number: string;
                    full_name: string;
                    date_of_birth: string;
                    jersey_number?: number | null;
                    position?: string | null;
                    photo_url?: string | null;
                    custom_fields?: Record<string, unknown>;
                    status?: CompetitionRegistration['status'];
                    registered_at?: string;
                };
                Update: Partial<CompetitionRegistration>;
                Relationships: [];
            };
            competition_registration_fields: {
                Row: CompetitionRegistrationField;
                Insert: {
                    id?: string;
                    competition_id: string;
                    field_name: string;
                    field_type: CompetitionRegistrationField['field_type'];
                    is_required?: boolean;
                    options?: unknown[];
                    display_order?: number;
                    created_at?: string;
                };
                Update: Partial<CompetitionRegistrationField>;
                Relationships: [];
            };
            player_competition_stats: {
                Row: PlayerCompetitionStats;
                Insert: {
                    id?: string;
                    competition_id: string;
                    player_id: string;
                    team_id: string;
                    games_played?: number;
                    goals?: number;
                    assists?: number;
                    yellow_cards?: number;
                    red_cards?: number;
                    minutes_played?: number;
                    clean_sheets?: number;
                    saves?: number;
                    goals_conceded?: number;
                    penalties_saved?: number;
                    updated_at?: string;
                };
                Update: Partial<PlayerCompetitionStats>;
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
