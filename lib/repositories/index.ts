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

class RepositoryFactory {
    private static instances: Record<string, any> = {};

    static getOrganizationRepository(): IOrganizationRepository {
        if (!this.instances.organization) {
            this.instances.organization = new OrganizationMockRepository();
        }
        return this.instances.organization;
    }

    static getCompetitionRepository(): ICompetitionRepository {
        if (!this.instances.competition) {
            this.instances.competition = new CompetitionMockRepository();
        }
        return this.instances.competition;
    }

    static getTeamRepository(): ITeamRepository {
        if (!this.instances.team) {
            this.instances.team = new TeamMockRepository();
        }
        return this.instances.team;
    }

    static getPlayerRepository(): IPlayerRepository {
        if (!this.instances.player) {
            this.instances.player = new PlayerMockRepository();
        }
        return this.instances.player;
    }

    static getMatchRepository(): IMatchRepository {
        if (!this.instances.match) {
            this.instances.match = new MatchMockRepository();
        }
        return this.instances.match;
    }

    static getCategoryRepository(): ICategoryRepository {
        if (!this.instances.category) {
            this.instances.category = new CategoryMockRepository();
        }
        return this.instances.category;
    }

    static getVenueRepository(): IVenueRepository {
        if (!this.instances.venue) {
            this.instances.venue = new VenueMockRepository();
        }
        return this.instances.venue;
    }

    static getGroupRepository(): IGroupRepository {
        if (!this.instances.group) {
            this.instances.group = new GroupMockRepository();
        }
        return this.instances.group;
    }

    static getRegistrationRepository(): IRegistrationRepository {
        if (!this.instances.registration) {
            this.instances.registration = new RegistrationMockRepository();
        }
        return this.instances.registration;
    }

    static getProfileRepository(): IProfileRepository {
        if (!this.instances.profile) {
            this.instances.profile = new ProfileMockRepository();
        }
        return this.instances.profile;
    }
}

// Export repository instances
export const repositories = {
    organization: RepositoryFactory.getOrganizationRepository(),
    competition: RepositoryFactory.getCompetitionRepository(),
    team: RepositoryFactory.getTeamRepository(),
    player: RepositoryFactory.getPlayerRepository(),
    match: RepositoryFactory.getMatchRepository(),
    category: RepositoryFactory.getCategoryRepository(),
    venue: RepositoryFactory.getVenueRepository(),
    group: RepositoryFactory.getGroupRepository(),
    registration: RepositoryFactory.getRegistrationRepository(),
    profile: RepositoryFactory.getProfileRepository(),
};

// Also export the factory for more control if needed
export { RepositoryFactory };
