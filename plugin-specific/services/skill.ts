import { Life } from "plugin-specific/models/life";
import { Rank, Skill } from "plugin-specific/models/skill";

export interface RankProgress {
    current: Rank | null;
    next: Rank | null;
    progress: number;
}

export class SkillService {
    static CalculateNumberOfUnits(life: Life, skill: Skill): number {
        let totalUnits = 0;

        const skillKV = life.concepts.find(kv => kv.value === skill);
        if (!skillKV) return 0;
        const skillKey = skillKV.key;

        for (const moment of life.moments) {
            const gainedUnit = moment.skillUnitsGained.find(su => su.skillKey === skillKey);
            if (gainedUnit) {
                totalUnits += gainedUnit.unitsGained;
            }
        }

        for (const subRef of skill.subskills) {
            const subskillKV = life.concepts.find(kv => kv.key === subRef.key);
            
            if (subskillKV) {
                const subskillTotal = this.CalculateNumberOfUnits(life, <Skill> subskillKV.value);
                totalUnits += (subskillTotal * subRef.weight);
            }
        }

        return totalUnits;
    }
    static GetRankProgress(life: Life, skill: Skill, totalUnits: number): RankProgress {
        const ranks: Rank[] = [];
        for (const key of skill.rankKeys) {
            const rankKV = life.concepts.find(kv => kv.key === key);
            if (rankKV) {
                ranks.push(<Rank> rankKV.value);
            }
        }
        const sortedRanks = ranks.sort((a, b) => a.threshold - b.threshold);
        
        let current: Rank | null = null;
        let next: Rank | null = null;
        
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
            progress = Math.min(Math.max(achievedInRange / range, 0), 1);
        } else if (current) {
            progress = 1;
        }

        return { current, next, progress };
    }
}