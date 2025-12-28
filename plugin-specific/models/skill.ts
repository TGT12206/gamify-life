import { Concept } from "./concept";

export class Skill extends Concept {
    override categoryKeys: string[] = ['Skill'];
    rankNames: string[] = [];
    subskills: { name: string, weight: number }[] = [];
    unitName: string = '';
}
export class Rank extends Concept {
    override categoryKeys: string[] = ['Skill Rank'];
    threshold: number = 10000;
}
export class SkillUnit extends Concept {
    override categoryKeys: string[] = ['Skill Unit'];
    isHoursSpent: boolean = true;
}
export class GainedSkillUnit {
    skillName: string = '';
    unitsGained: number = 0;
}