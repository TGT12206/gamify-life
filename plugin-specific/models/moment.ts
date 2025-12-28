import { Concept } from "./concept";
import { GainedSkillUnit } from "./skill";

export class Moment extends Concept {
    startTime: Date = new Date();
    endTime: Date = new Date();
    skillUnitsGained: GainedSkillUnit[] = [];
    conceptNames: string[] = [];
}