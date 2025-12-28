import { Life } from "plugin-specific/models/life";
import { Rank, Skill } from "plugin-specific/models/skill";
import { ConceptService } from "./concept";

export interface RankProgress {
    current: Rank | null;
    next: Rank | null;
    progress: number;
}

export class SkillService {
    static CalculateNumberOfUnits(life: Life, skill: Skill): number {
        let totalUnits = 0;

        for (let i = 0; i < life.moments.length; i++) {
            const moment = life.moments[i];
            const gainedUnit = moment.skillUnitsGained.find(su => su.skillName === skill.name);

            if (gainedUnit !== undefined) {
                totalUnits += gainedUnit.unitsGained;
            }
        }

        for (let i = 0; i < skill.subskills.length; i++) {
            const subskillRef = skill.subskills[i];
            const subskill = ConceptService.GetConceptByName(life, subskillRef.name);
            
            if (subskill !== undefined) {
                const subskillTotal = this.CalculateNumberOfUnits(life, <Skill> subskill);
                totalUnits += (subskillTotal * subskillRef.weight);
            }
        }

        return totalUnits;
    }
    static GetRankProgress(life: Life, skill: Skill, totalUnits: number): RankProgress {
        const ranks: Rank[] = [];
        for (let i = 0; i < skill.rankNames.length; i++) {
            const rankName = skill.rankNames[i];
            const rank = ConceptService.GetConceptByName(life, rankName);
            
            if (rank !== undefined) {
                ranks.push(<Rank> rank);
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