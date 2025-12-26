import { Quest } from "plugin-specific/models/quest";

export class QuestService {
    static MostRecentStartTime(quest: Quest): Date | null {
        if (quest.startTimes.length === 0 || !quest.initialDate) return null;

        const now = new Date();
        const startOfInitial = new Date(quest.initialDate.getFullYear(), quest.initialDate.getMonth(), quest.initialDate.getDate());
        
        let bestDate: Date | null = null;

        const isActiveInterval = (occurrenceDate: Date): boolean => {
            let diff = 0;
            const occ = new Date(occurrenceDate.getFullYear(), occurrenceDate.getMonth(), occurrenceDate.getDate());

            switch (quest.type) {
                case 'daily':
                    diff = Math.floor((occ.getTime() - startOfInitial.getTime()) / (1000 * 60 * 60 * 24));
                    break;
                case 'weekly':
                    diff = Math.floor((occ.getTime() - startOfInitial.getTime()) / (1000 * 60 * 60 * 24 * 7));
                    break;
                case 'monthly':
                    diff = (occ.getFullYear() - startOfInitial.getFullYear()) * 12 + (occ.getMonth() - startOfInitial.getMonth());
                    break;
                case 'yearly':
                    diff = occ.getFullYear() - startOfInitial.getFullYear();
                    break;
                default: return true;
            }
            return diff >= 0 && (diff % quest.interval === 0);
        };

        let searchDate = new Date(now);
        const lookbackLimit = 366 * quest.interval;
        let daysSearched = 0;

        while (daysSearched <= lookbackLimit) {
            if (isActiveInterval(searchDate)) {
                for (const st of quest.startTimes) {
                    const potential = new Date(searchDate);
                    potential.setHours(st.hour, st.minute, 0, 0);

                    // Validation for Weekly/Monthly/Yearly specific days
                    let isValidDay = true;
                    if (quest.type === 'weekly' && potential.getDay() !== st.day) isValidDay = false;
                    if (quest.type === 'monthly' && potential.getDate() !== st.day) isValidDay = false;
                    if (quest.type === 'yearly' && (potential.getMonth() + 1 !== st.month || potential.getDate() !== st.day)) isValidDay = false;

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

    static IsCompleted(quest: Quest): boolean {
        if (quest.type === 'one-off') {
            return quest.completionDates.length > 0;
        }
        const mostRecentStartTime = this.MostRecentStartTime(quest);
        if (mostRecentStartTime === null) {
            return false;
        }
        return quest.completionDates.some(d => new Date(d).getTime() >= mostRecentStartTime.getTime());
    }

    static ToggleCompletion(quest: Quest): void {
        const now = new Date();

        if (this.IsCompleted(quest)) {
            quest.completionDates.pop();
        } else {
            quest.completionDates.push(now);
        }
    }
}