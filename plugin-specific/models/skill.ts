import { Notice } from "obsidian";
import { Concept } from "./concept";
import { Life } from "./life";
import { Moment } from "./moment";

export interface SubskillReference {
    key: string;
    weight: number;
}

/**
 * A skill that is being tracked by the player
 */
export class Skill extends Concept {
    override categoryKeys: string[] = ['Skill'];
    
    /**
     * An array of references to ranks used by this skill
     */
    rankKeys: string[] = [];

    /**
     * An array of references to this skill
     */
    subskills: SubskillReference[] = [];

    /**
     * A reference to the unit used to measure this skill
     */
    unitKey: string = '';

    override RemoveConceptReferenceFromSelf(key: string): void {
        super.RemoveConceptReferenceFromSelf(key);
        if (this.unitKey === key) this.unitKey = '';
        this.subskills = this.subskills.filter(ss => ss.key !== key);
    }

    /**
     * Returns the number of units earned for this skill so far
     */
    CalculateNumberOfUnits(life: Life): number {
        let totalUnits = 0;

        const moments = <Moment[]> [...life.concepts.values()].filter(c => c.baseCategory === 'Moment');
        const key = life.FindKey(this);
        if (key === undefined) {
            const errorMessage = 'Somehow this skill doesn\t exist even though it\'s being used';
            new Notice(errorMessage);
            throw Error(errorMessage);
        }

        for (let i = 0; i < moments.length; i++) {
            const moment = moments[i];
            const gainedUnit = moment.skillUnitsEarned.find(su => su.skillKey === key);

            if (gainedUnit !== undefined) {
                totalUnits += gainedUnit.unitsEarned;
            }
        }

        for (let i = 0; i < this.subskills.length; i++) {
            const subskillRef = this.subskills[i];
            const subskill = life.concepts.get(subskillRef.key);
            
            if (subskill !== undefined) {
                const subskillTotal = (<Skill> subskill).CalculateNumberOfUnits(life);
                totalUnits += (subskillTotal * subskillRef.weight);
            }
        }

        return totalUnits;
    }
    
    /**
     * Returns the current rank, next rank, and current progress in % of this skill
     */
    GetRankProgress(life: Life): SkillProgress {
        const totalUnits = this.CalculateNumberOfUnits(life);

        const rankKeys = this.rankKeys;
        const ranks: Rank[] = [];

        for (let i = 0; i < rankKeys.length; i++) {
            const rankKey = rankKeys[i];
            const rank = life.concepts.get(rankKey);
            
            if (rank !== undefined) {
                ranks.push(<Rank> rank);
            }
        }
        
        const sortedRanks = ranks.sort((a, b) => a.threshold - b.threshold);
        
        let current: Rank | undefined = undefined;
        let next: Rank | undefined = undefined;
        
        for (let i = 0; i < sortedRanks.length; i++) {
            if (totalUnits >= sortedRanks[i].threshold) {
                current = sortedRanks[i];
            } else {
                next = sortedRanks[i];
                break;
            }
        }

        let progress = 0;
        if (next) {
            const lowerBound = current ? current.threshold : 0;
            const range = next.threshold - lowerBound;
            const achievedInRange = totalUnits - lowerBound;
            progress = Math.min(Math.max((achievedInRange / range) * 100, 0), 100);
        } else {
            progress = 100;
        }

        return { current, next, totalUnits, progress };
    }
}

/**
 * A rank achievable for a skill, when the number of units
 * in that skill is reached.
 */
export class Rank extends Concept {
    override categoryKeys: string[] = ['Rank'];

    /**
     * The number of units required to achieve this rank
     */
    threshold: number = 10000;
}

/**
 * A unit for measuring the progress made in a skill
 */
export class Unit extends Concept {
    override categoryKeys: string[] = ['Unit'];
}

/**
 * A representation of progress being made in a skill
 */
export class EarnedSkillUnit {
    /**
     * A reference to the skill being practiced
     */
    skillKey: string = '';
    
    /**
     * The number of units earned
     */
    unitsEarned: number = 0;
}

export interface SkillProgress {
    /**
     * The current highest rank achieved, or undefined
     */
    current: Rank | undefined;

    /**
     * The immediate next rank not yet achieved, or undefined
     */
    next: Rank | undefined;

    /**
     * The raw # of units earned so far
     */
    totalUnits: number;

    /**
     * The amount of progress, in %, from 0-100 with respect to the next rank
     */
    progress: number;
}