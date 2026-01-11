import { Concept } from "./concept";
import { QuestType } from "./const";

/**
 * A task that can be completed by the player.
 * It may or may not repeat periodically
 */
export class Quest extends Concept {
    override categoryKeys: string[] = ['Quest'];
    
    /**
     * The timespan that repeats are based off of
     */
    type: QuestType = 'One-Off';
    
    /**
     * The number of timespans to wait before resets happen again
     */
    interval: number = 1;
    
    /**
     * The start times for resets within an active interval
     */
    startTimes: StartTime[] = [];
    
    /**
     * The date and times at which the player has previously completed this quest
     */
    completionDates: Date[] = [];
    
    /**
     * The initial date and time used to calculate intervals and repeats
     */
    initialDate: Date = new Date();

    /**
     * The most recent start time of the quest
     */
    get mostRecentStartTime(): Date | undefined {
        if (this.startTimes.length === 0) return undefined;

        const now = new Date();
        const startOfInitial = new Date(this.initialDate.getFullYear(), this.initialDate.getMonth(), this.initialDate.getDate());
        
        let bestDate: Date | undefined = undefined;

        const isActiveInterval = (occurrenceDate: Date): boolean => {
            let diff = 0;
            const occ = new Date(occurrenceDate.getFullYear(), occurrenceDate.getMonth(), occurrenceDate.getDate());

            switch (this.type) {
                case 'Daily':
                    diff = Math.floor((occ.getTime() - startOfInitial.getTime()) / (1000 * 60 * 60 * 24));
                    break;
                case 'Weekly':
                    diff = Math.floor((occ.getTime() - startOfInitial.getTime()) / (1000 * 60 * 60 * 24 * 7));
                    break;
                case 'Monthly':
                    diff = (occ.getFullYear() - startOfInitial.getFullYear()) * 12 + (occ.getMonth() - startOfInitial.getMonth());
                    break;
                case 'Yearly':
                    diff = occ.getFullYear() - startOfInitial.getFullYear();
                    break;
                default: return true;
            }
            return diff >= 0 && (diff % this.interval === 0);
        };

        let searchDate = new Date(now);
        const lookbackLimit = 366 * this.interval;
        let daysSearched = 0;

        while (daysSearched <= lookbackLimit) {
            if (isActiveInterval(searchDate)) {
                for (const st of this.startTimes) {
                    const potential = new Date(searchDate);
                    potential.setHours(st.hour, st.minute, 0, 0);

                    // Validation for Weekly/Monthly/Yearly specific days
                    let isValidDay = true;
                    if (this.type === 'Weekly' && potential.getDay() !== st.day) isValidDay = false;
                    if (this.type === 'Monthly' && potential.getDate() !== st.day) isValidDay = false;
                    if (this.type === 'Yearly' && (potential.getMonth() + 1 !== st.month || potential.getDate() !== st.day)) isValidDay = false;

                    if (isValidDay && potential <= now) {
                        if (!bestDate || potential > bestDate) {
                            bestDate = new Date(potential);
                        }
                    }
                }
            }
            
            if (bestDate) break;

            searchDate.setDate(searchDate.getDate() - 1);
            daysSearched++;
        }

        return bestDate;
    }

    /**
     * Whether or not the quest is currently completed
     */
    get isCompleted(): boolean {
        if (this.type === 'One-Off') {
            return this.completionDates.length > 0;
        }
        const mostRecentStartTime = this.mostRecentStartTime;
        if (mostRecentStartTime === undefined) {
            return false;
        }
        return this.completionDates.some(d => new Date(d).getTime() >= mostRecentStartTime.getTime());
    }

    /**
     * Toggles completion of the quest
     */
    ToggleCompletion(): boolean {
        const now = new Date();

        if (this.isCompleted) {
            this.completionDates.pop();
        } else {
            this.completionDates.push(now);
        }
        return this.isCompleted;
    }
}

/**
 * Contains information about when to reset a quest while it is in an active interval
 */
export class StartTime {
    /**
     * The month of the year to reset
     */
    month: number = 0;
    
    /**
     * Either the day of the month or the day of the week to reset,
     * depending on the timespan of the quest (monthly/weekly)
     */
    day: number = 0;
    
    /**
     * The hour of the day to reset
     */
    hour: number = 0;
    
    /**
     * The minute of the hour to reset
     */
    minute: number = 0;
}