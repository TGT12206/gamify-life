export class Skill {
    name: string = '';
    parentSkillPath: string | undefined = undefined;
    mediaFilePaths: string[] = [];
    milestones: SkillLevel[] = [];
    subskillPaths: string[] = [];
    weights: number[] = [];
    unitType: SkillUnit = new SkillUnit();
}
export class SkillLevel {
    name: string = '';
    threshold: number = 0;
    mediaFilePaths: string[] = [];
}
export class SkillUnit {
    name: string = '';
    isTimeBased: boolean = true;
}
export class GainedSkillUnit {
    skillPath: string;
    unitsGained: number;
}