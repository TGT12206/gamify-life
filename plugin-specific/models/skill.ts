import { Concept } from "./concept";

export class Skill extends Concept {
    rankKeys: string[] = [];
    subskills: { key: string, weight: number }[] = [];
    unitKey: string = '';
}
export class Rank extends Concept {
    threshold: number = 10000;
}
export class SkillUnit extends Concept {
    isHoursSpent: boolean = true;
}
export class GainedSkillUnit {
    skillKey: string = '';
    unitsGained: number = 0;
}