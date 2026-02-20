/**
 * Organizations Mock Fixtures - PLYAZ League Manager
 */

export interface MockOrganization {
    id: string;
    name: string;
    slug: string;
    status: 'active' | 'pending' | 'suspended';
    members: number;
    color: string;
}

export const MOCK_ORGS: MockOrganization[] = [
    { id: '1', name: 'Elite Premier League', slug: 'elite-premier', status: 'active', members: 12, color: 'bg-gray-900' },
    { id: '2', name: 'Youth Soccer Assoc', slug: 'youth-soccer', status: 'active', members: 45, color: 'bg-orange-600' },
    { id: '3', name: 'Corporate Cup', slug: 'corp-cup', status: 'pending', members: 8, color: 'bg-blue-600' },
];

export const MOCK_CURRENT_ORG = MOCK_ORGS[0];
