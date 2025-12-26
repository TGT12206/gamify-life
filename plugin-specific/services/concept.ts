import { Life } from "plugin-specific/models/life";
import { Moment } from "plugin-specific/models/moment";
import { Observation } from "plugin-specific/models/observation";
import { Skill } from "plugin-specific/models/skill";
import { KeyService } from "./key";

export class ConceptService {
    static GetNameFromKey(life: Life, key: string) {
        const result = KeyService.Get(life.concepts, key);
        if (result === undefined) {
            return result;
        }
        return result.name;
    }
    /**
     * Deletes the concept key from the plugin, propagating the change.
     * @param concept either the key or the index of the concept
     */
    static DeleteConcept(life: Life, concept: number | string): void {
        let index: number;
        let keyToDelete: string;
        
        if (typeof concept === 'number') {
            index = concept;
            if (index < 0 || index >= life.concepts.length) return;
            keyToDelete = life.concepts[index].key;
        } else {
            keyToDelete = concept;
            index = KeyService.FindKey(life.concepts, keyToDelete);
        }

        life.concepts.splice(index, 1);

        for (const item of life.concepts) {
            const concept = item.value;

            if (concept.categoryKeys.contains('Moment')) {
                const moment = <Moment> concept;
                moment.conceptKeys = moment.conceptKeys.filter(k => k !== keyToDelete);
                moment.skillUnitsGained = moment.skillUnitsGained.filter(su => su.skillKey !== keyToDelete);
            } else if (concept.categoryKeys.contains('Observation')) {
                const observation = <Observation> concept;
                observation.conceptKeys = observation.conceptKeys.filter(k => k !== keyToDelete);
                observation.evidenceList = observation.evidenceList.filter(e => !(e.sourceType === 'Concept' && e.sourceKey === keyToDelete));
            } else if (concept.categoryKeys.contains('Skill')) {
                const skill = <Skill> concept;
                if (skill.unitKey === keyToDelete) skill.unitKey = '';
                skill.subskills = skill.subskills.filter(ss => ss.key !== keyToDelete);
            }
        }
    }
    /**
     * Changes the concept key
     * @param concept either the key or the index of the concept
     */
    static ChangeConceptKey(life: Life, concept: number | string, newKey: string): void {
        let index: number;
        let keyToChange: string;
        
        if (typeof concept === 'number') {
            index = concept;
            if (index < 0 || index >= life.concepts.length) return;
            keyToChange = life.concepts[index].key;
        } else {
            keyToChange = concept;
            index = KeyService.FindKey(life.concepts, keyToChange);
            if (index < 0 || index >= life.mediaPaths.length) return;
        }

        life.concepts[index].key = newKey;

        for (const item of life.concepts) {
            const concept = item.value;

            if (concept.categoryKeys.contains('Moment')) {
                const moment = <Moment> concept;
                KeyService.ChangeKeyReference(moment.conceptKeys, keyToChange, newKey);
                KeyService.ChangeInnerKeyReference(
                    moment.skillUnitsGained,
                    (su) => { return su.skillKey === keyToChange },
                    (i) => { return moment.skillUnitsGained[i].skillKey = newKey }
                );
            } else if (concept.categoryKeys.contains('Observation')) {
                const observation = <Observation> concept;
                KeyService.ChangeKeyReference(observation.conceptKeys, keyToChange, newKey);
                KeyService.ChangeInnerKeyReference(
                    observation.evidenceList,
                    (e) => { return e.sourceType === 'Concept' && e.sourceKey === keyToChange },
                    (i) => { return observation.evidenceList[i].sourceKey = newKey }
                );
            } else if (concept.categoryKeys.contains('Skill')) {
                const skill = <Skill> concept;
                if (skill.unitKey === keyToChange) skill.unitKey = newKey;
                KeyService.ChangeInnerKeyReference(
                    skill.subskills,
                    (ss) => { return ss.key === keyToChange },
                    (i) => { return skill.subskills[i].key = newKey }
                );
            }
        }
    }
}