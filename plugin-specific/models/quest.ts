import { Concept } from "./concept";
import { QuestType } from "./const";

export class Quest extends Concept {
    type: QuestType = 'one-off';
    interval: number = 1;
    startTimes: StartTime[] = [];
    completionDates: Date[] = [];
    initialDate: Date = new Date();
}

export class StartTime {
    month: number = 0;
    day: number = 0;
    hour: number = 0;
    minute: number = 0;
}