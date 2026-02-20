/**
 * Repository Pattern Interfaces — PLYAZ League Manager
 * 
 * Defines the contract for all data access layers (Mock vs Supabase).
 */

import type {
    Competition,
    Team,
    Player,
    Match,
    MatchEvent,
    Organization,
    Profile,
    Venue,
    Category,
    StandingsEntry,
    Group,
    CompetitionRegistration
} from '@/lib/supabase/types';

/**
 * Base Repository Interface
 */
export interface IRepository<T> {
    findAll(filters?: Record<string, any>): Promise<T[]>;
    findById(id: string): Promise<T | null>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
}

/**
 * Domain-Specific Repository Interfaces
 */

export interface IOrganizationRepository extends IRepository<Organization> {
    findBySlug(slug: string): Promise<Organization | null>;
    getMembers(orgId: string): Promise<Profile[]>;
}

export interface ICompetitionRepository extends IRepository<Competition> {
    findByOrganization(orgId: string): Promise<Competition[]>;
    getStandings(competitionId: string): Promise<StandingsEntry[]>;
}

export interface ITeamRepository extends IRepository<Team> {
    findByCompetition(competitionId: string): Promise<Team[]>;
}

export interface IPlayerRepository extends IRepository<Player> {
    findByTeam(teamId: string): Promise<Player[]>;
    findByCompetition(competitionId: string): Promise<Player[]>;
}

export interface IMatchRepository extends IRepository<Match> {
    findByCompetition(competitionId: string): Promise<Match[]>;
    findByTeam(teamId: string): Promise<Match[]>;
    getEvents(matchId: string): Promise<MatchEvent[]>;
    addEvent(event: Partial<MatchEvent>): Promise<MatchEvent>;
}

export interface IVenueRepository extends IRepository<Venue> { }
export interface ICategoryRepository extends IRepository<Category> { }
export interface IProfileRepository extends IRepository<Profile> {
    findByUserId(userId: string): Promise<Profile | null>;
}
export interface IGroupRepository extends IRepository<Group> {
    findByCompetition(competitionId: string): Promise<Group[]>;
}
export interface IRegistrationRepository extends IRepository<CompetitionRegistration> {
    findByCompetition(competitionId: string): Promise<CompetitionRegistration[]>;
}
