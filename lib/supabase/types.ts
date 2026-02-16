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
// DATABASE TYPE (for Supabase client)
// ============================================

export type Database = {
    public: {
        Tables: {
            organizations: { Row: Organization; Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>; };
            profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>; };
            competitions: { Row: Competition; Insert: Omit<Competition, 'id' | 'created_at' | 'updated_at' | 'invite_code'>; Update: Partial<Omit<Competition, 'id' | 'created_at' | 'updated_at'>>; };
            teams: { Row: Team; Insert: Omit<Team, 'id' | 'created_at' | 'updated_at' | 'invite_code'>; Update: Partial<Omit<Team, 'id' | 'created_at' | 'updated_at'>>; };
            players: { Row: Player; Insert: Omit<Player, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Player, 'id' | 'created_at' | 'updated_at'>>; };
            matches: { Row: Match; Insert: Omit<Match, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Match, 'id' | 'created_at' | 'updated_at'>>; };
            match_events: { Row: MatchEvent; Insert: Omit<MatchEvent, 'id' | 'created_at'>; Update: Partial<Omit<MatchEvent, 'id' | 'created_at'>>; };
            standings: { Row: StandingsEntry; Insert: Omit<StandingsEntry, 'id' | 'goal_difference' | 'updated_at'>; Update: Partial<Omit<StandingsEntry, 'id' | 'goal_difference' | 'updated_at'>>; };
            invites: { Row: Invite; Insert: Omit<Invite, 'id' | 'created_at' | 'token'>; Update: Partial<Omit<Invite, 'id' | 'created_at'>>; };
        };
    };
};
