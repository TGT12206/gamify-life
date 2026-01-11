/**
 * The key that is reserved for the concept describing the player
 */
export const playerKey: string = 'Self';

/**
 * The keys and default names for the concept categories that are
 * used by the plugin
 */
export const baseCategories = [
    'Person',
    'Item or Space',
    'Skill',
    'Rank',
    'Unit',
    'Moment',
    'Claim',
    'Quest'
] as const;

export type BaseCategory = typeof baseCategories[number];

/**
 * The various types of evidence that can be used to support a claim
 */
export const evidenceTypes = [
    'Concept',
    'Media',
    'Unknown'
] as const;

/**
 * One of the types of evidence that can be used to support a claim
 */
export type EvidenceType = typeof evidenceTypes[number];

/**
 * The different time spans at which a quest can repeat
 */
export const questTypes = [
    'One-Off',
    'Daily',
    'Weekly',
    'Monthly',
    'Yearly'
] as const;

/**
 * One of the time spans that a quest can repeat at
 */
export type QuestType = typeof questTypes[number];