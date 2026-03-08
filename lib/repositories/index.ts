/**
 * Repository Factory — PLYAZ League Manager
 * 
 * Provides repository instances. Currently returns Mock implementations,
 * but can be easily swapped for Supabase implementations in the future.
 */

import { OrganizationMockRepository } from './organization.mock';
import { CompetitionMockRepository } from './competition.mock';
import { TeamMockRepository } from './team.mock';
import { PlayerMockRepository } from './player.mock';
import { MatchMockRepository } from './match.mock';
import { CategoryMockRepository, VenueMockRepository } from './shared.mock';
import { GroupMockRepository, RegistrationMockRepository } from './tournament.mock';
import { ProfileMockRepository } from './profile.mock';

import { OrganizationSupabaseRepository } from './organization.supabase';
import { CompetitionSupabaseRepository } from './competition.supabase';
import { TeamSupabaseRepository } from './team.supabase';
import { PlayerSupabaseRepository } from './player.supabase';
import { ProfileSupabaseRepository } from './profile.supabase';
import { MatchSupabaseRepository } from './match.supabase';
import { GroupSupabaseRepository, RegistrationSupabaseRepository } from './tournament.supabase';
import { CategorySupabaseRepository, VenueSupabaseRepository } from './shared.supabase';

import {
    IOrganizationRepository,
    ICompetitionRepository,
    ITeamRepository,
    IPlayerRepository,
    IMatchRepository,
    ICategoryRepository,
    IVenueRepository,
    IGroupRepository,
    IRegistrationRepository,
    IProfileRepository
} from './types';

/**
 * Determines if we should use Mock repositories.
 * Logic:
 * 1. Check if we are on the client and simulation is enabled in localStorage.
 * 2. Check if a specific environment variable is set to true.
 */
const getShouldUseMock = (): boolean => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('plyaz_simulation_enabled') === 'true';
    }
    return process.env.NEXT_PUBLIC_USE_MOCK_REPOS === 'true';
};

class RepositoryFactory {
    private static instances: Record<string, unknown> = {};

    static getOrganizationRepository(): IOrganizationRepository {
        if (!this.instances.organization) {
            this.instances.organization = getShouldUseMock()
                ? new OrganizationMockRepository()
                : new OrganizationSupabaseRepository();
        }
        return this.instances.organization as IOrganizationRepository;
    }

    static getCompetitionRepository(): ICompetitionRepository {
        if (!this.instances.competition) {
            this.instances.competition = getShouldUseMock()
                ? new CompetitionMockRepository()
                : new CompetitionSupabaseRepository();
        }
        return this.instances.competition as ICompetitionRepository;
    }

    static getTeamRepository(): ITeamRepository {
        if (!this.instances.team) {
            this.instances.team = getShouldUseMock()
                ? new TeamMockRepository()
                : new TeamSupabaseRepository();
        }
        return this.instances.team as ITeamRepository;
    }

    static getPlayerRepository(): IPlayerRepository {
        if (!this.instances.player) {
            this.instances.player = getShouldUseMock()
                ? new PlayerMockRepository()
                : new PlayerSupabaseRepository();
        }
        return this.instances.player as IPlayerRepository;
    }

    static getMatchRepository(): IMatchRepository {
        if (!this.instances.match) {
            this.instances.match = getShouldUseMock()
                ? new MatchMockRepository()
                : new MatchSupabaseRepository();
        }
        return this.instances.match as IMatchRepository;
    }

    static getCategoryRepository(): ICategoryRepository {
        if (!this.instances.category) {
            this.instances.category = getShouldUseMock()
                ? new CategoryMockRepository()
                : new CategorySupabaseRepository();
        }
        return this.instances.category as ICategoryRepository;
    }

    static getVenueRepository(): IVenueRepository {
        if (!this.instances.venue) {
            this.instances.venue = getShouldUseMock()
                ? new VenueMockRepository()
                : new VenueSupabaseRepository();
        }
        return this.instances.venue as IVenueRepository;
    }

    static getGroupRepository(): IGroupRepository {
        if (!this.instances.group) {
            this.instances.group = getShouldUseMock()
                ? new GroupMockRepository()
                : new GroupSupabaseRepository();
        }
        return this.instances.group as IGroupRepository;
    }

    static getRegistrationRepository(): IRegistrationRepository {
        if (!this.instances.registration) {
            this.instances.registration = getShouldUseMock()
                ? new RegistrationMockRepository()
                : new RegistrationSupabaseRepository();
        }
        return this.instances.registration as IRegistrationRepository;
    }

    static getProfileRepository(): IProfileRepository {
        if (!this.instances.profile) {
            this.instances.profile = getShouldUseMock()
                ? new ProfileMockRepository()
                : new ProfileSupabaseRepository();
        }
        return this.instances.profile as IProfileRepository;
    }

    /**
     * Resets instances — useful if the mock/supabase toggle changes without a full page reload.
     */
    static reset() {
        this.instances = {};
    }
}

// Export repository interface-compliant proxies or direct instances
// Note: On the client, toggling the simulation usually triggers a page reload, 
// so these static assignments are generally safe.
export const repositories = {
    get organization() { return RepositoryFactory.getOrganizationRepository(); },
    get competition() { return RepositoryFactory.getCompetitionRepository(); },
    get team() { return RepositoryFactory.getTeamRepository(); },
    get player() { return RepositoryFactory.getPlayerRepository(); },
    get match() { return RepositoryFactory.getMatchRepository(); },
    get category() { return RepositoryFactory.getCategoryRepository(); },
    get venue() { return RepositoryFactory.getVenueRepository(); },
    get group() { return RepositoryFactory.getGroupRepository(); },
    get registration() { return RepositoryFactory.getRegistrationRepository(); },
    get profile() { return RepositoryFactory.getProfileRepository(); },
};

export { RepositoryFactory };
