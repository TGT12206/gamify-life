export class Task {
    mediaPaths: string[] = [];
    description: string = '';
    type: TaskType = 'one-off';
    interval: number = 1;
    startTimes: StartTime[] = [];
    completionDates: Date[] = [];
}
export class StartTime {
    month: number = 0;
    day: number = 0;
    hour: number = 0;
    minute: number = 0;
}

export const taskTypes = [
    'one-off',
    'daily',
    'weekly',
    'monthly',
    'yearly'
] as const;

export type TaskType = typeof taskTypes[number];