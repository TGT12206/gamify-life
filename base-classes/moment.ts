import { GainedSkillUnit } from "./skill";

export class Moment {
    name: string = '';
    startTime: Date = new Date();
    endTime: Date = new Date();
    mediaPaths: string[] = [];
    description: string = '';
    skillUnitsGained: GainedSkillUnit[] = [];
    taskPaths: string[] = []; // unused for now
    peoplePaths: string[] = []; // unused for now
    observationPaths: string[] = []; // unused for now
}