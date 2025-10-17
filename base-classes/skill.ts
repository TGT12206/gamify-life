export class Skill {
    name: string;
    parentSkillPath: string | undefined = undefined;
    description: string;
    mediaPaths: string[] = [];
    levels: SkillLevel[] = [];
    subskillPaths: string[] = [];
    weights: number[] = [];
    unitType: SkillUnit = new SkillUnit();
}
export class SkillLevel {
    name: string = 'Master';
    threshold: number = 10000;
    mediaPath: string = '';
}
export class SkillUnit {
    name: string = 'Hours Spent';
    isHoursSpent: boolean = true;
}
export class GainedSkillUnit {
    skillPath: string = '';
    unitsGained: number;
}