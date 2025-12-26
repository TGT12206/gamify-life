export const BaseCategories: string[] = [
    'Person',
    'Skill',
    'Skill Rank',
    'Skill Unit',
    'Moment',
    'Observation',
    'Quest'
] as const;

export const evidenceTypes = [
    'Media',
    'Concept',
    'Unknown'
] as const;

export type EvidenceType = typeof evidenceTypes[number];

export const questTypes = [
    'one-off',
    'daily',
    'weekly',
    'monthly',
    'yearly'
] as const;

export type QuestType = typeof questTypes[number];