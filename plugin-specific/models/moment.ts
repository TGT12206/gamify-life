import { Concept } from "./concept";
import { GainedSkillUnit } from "./skill";

export class Moment extends Concept {
    override categoryKeys: string[] = ['Moment'];
    startTime: Date = new Date();
    endTime: Date = new Date();
    skillUnitsGained: GainedSkillUnit[] = [];
    conceptNames: string[] = [];
}