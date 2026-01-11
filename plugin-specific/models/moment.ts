import { Concept } from "./concept";
import { Life } from "./life";
import { EarnedSkillUnit } from "./skill";

/**
 * A concept that represents a specific moment in time
 * or event
 */
export class Moment extends Concept {
    override categoryKeys: string[] = ['Moment'];

    override GetName(life: Life): string | undefined {
        let name = '';
        const st = this.startTime;
        const et = this.startTime;

        if (et.getFullYear() === st.getFullYear()) {
            name = st.getFullYear() + name;
            if (et.getMonth() === st.getMonth()) {
                name = name + '/' + (st.getMonth() < 9 ? '0' : '') + (st.getMonth() + 1);
                if (et.getDate() === st.getDate()) {
                    name = name + '/' + (st.getDate() < 10 ? '0' : '') + st.getDate();
                }
            }
        }
        if (this.aliases.length > 0) {
            name += (name.length > 0 ? ': ' : '') + this.aliases[0];
        }

        return name;
    }

    /**
     * The date and time that this moment began
     */
    startTime: Date = new Date();

    /**
     * The date and time that this moment ended
     */
    endTime: Date = new Date();
    
    /**
     * An array of the skills used during this moment
     * 
     * Used to calculate the XP for a given skill
     */
    skillUnitsEarned: EarnedSkillUnit[] = [];
    
    /**
     * An array of references to concepts that were
     * relevant to this moment
     */
    conceptKeys: string[] = [];

    override RemoveConceptReferenceFromSelf(key: string): void {
        super.RemoveConceptReferenceFromSelf(key);
        this.conceptKeys = this.conceptKeys.filter(k => k !== key);
        this.skillUnitsEarned = this.skillUnitsEarned.filter(su => su.skillKey !== key);
    }
}