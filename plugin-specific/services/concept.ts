import { Life } from "plugin-specific/models/life";
import { Moment } from "plugin-specific/models/moment";
import { Observation } from "plugin-specific/models/observation";
import { Skill } from "plugin-specific/models/skill";
import { KeyService } from "./key";
import { Concept } from "plugin-specific/models/concept";

export class ConceptService {
    static GetIndexByName(life: Life, name: string) {
        const concepts = life.concepts;
        let low = 0;
        let high = concepts.length;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            const midName = concepts[mid].name;

            if (midName < name) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        if (low < concepts.length && concepts[low].name === name) {
            return low;
        }
        return -1;
    }

    static CheckIfNameIsTaken(life: Life, name: string) {
        const index = this.GetIndexByName(life, name);
        return index !== -1;
    }

    static GetConceptByName(life: Life, name: string) {
        const index = this.GetIndexByName(life, name);
        if (index === -1) {
            return undefined;
        }
        return life.concepts[index];
    }

    /**
     * Deletes the concept key from the plugin, propagating the change.
     * @param concept either the name or the index of the concept
     */
    static DeleteConcept(life: Life, concept: number | string): void {
        let index: number;
        let nameToDelete: string;
        
        if (typeof concept === 'number') {
            index = concept;
            if (index < 0 || index >= life.concepts.length) return;
            nameToDelete = life.concepts[index].name;
        } else {
            nameToDelete = concept;
            index = this.GetIndexByName(life, nameToDelete);
        }

        life.concepts.splice(index, 1);

        for (let i = 0; i < life.concepts.length; i++) {
            const concept = life.concepts[i];

            if (concept.categoryKeys.contains('Moment')) {
                const moment = <Moment> concept;
                moment.conceptNames = moment.conceptNames.filter(n => n !== nameToDelete);
                moment.skillUnitsGained = moment.skillUnitsGained.filter(su => su.skillName !== nameToDelete);
            } else if (concept.categoryKeys.contains('Observation')) {
                const observation = <Observation> concept;
                observation.conceptNames = observation.conceptNames.filter(n => n !== nameToDelete);
                observation.evidenceList = observation.evidenceList.filter(e => !(e.sourceType === 'Concept' && e.source === nameToDelete));
            } else if (concept.categoryKeys.contains('Skill')) {
                const skill = <Skill> concept;
                if (skill.unitName === nameToDelete) skill.unitName = '';
                skill.subskills = skill.subskills.filter(ss => ss.name !== nameToDelete);
            }
        }
    }

    /**
     * Changes the name of the concept
     * @param concept either the key or the index of the concept
     */
    static ChangeConceptName(life: Life, concept: Concept, newName: string): void {
        const oldName = concept.name;
        const index = this.GetIndexByName(life, concept.name);
        
        concept.name = newName;
        
        if (index === -1) {
            return;
        }
        
        this.ResortConcepts(life.concepts, index);

        for (let i = 0; i < life.concepts.length; i++) {
            const concept = life.concepts[i];

            if (concept.categoryKeys.contains('Moment')) {
                const moment = <Moment> concept;
                KeyService.ChangeKeyReference(moment.conceptNames, oldName, newName);
                KeyService.ChangeInnerKeyReference(
                    moment.skillUnitsGained,
                    (su) => { return su.skillName === oldName },
                    (i) => { return moment.skillUnitsGained[i].skillName = newName }
                );
            } else if (concept.categoryKeys.contains('Observation')) {
                const observation = <Observation> concept;
                KeyService.ChangeKeyReference(observation.conceptNames, oldName, newName);
                KeyService.ChangeInnerKeyReference(
                    observation.evidenceList,
                    (e) => { return e.sourceType === 'Concept' && e.source === oldName },
                    (i) => { return observation.evidenceList[i].source = newName }
                );
            } else if (concept.categoryKeys.contains('Skill')) {
                const skill = <Skill> concept;
                if (skill.unitName === oldName) skill.unitName = newName;
                KeyService.ChangeInnerKeyReference(
                    skill.subskills,
                    (ss) => { return ss.name === oldName },
                    (i) => { return skill.subskills[i].name = newName }
                );
            }
        }
    }

    private static ResortConcepts(concepts: Concept[], changedIndex: number) {
        const changedConcept = concepts.splice(changedIndex, 1)[0];
        this.InsertConcept(concepts, changedConcept);
    }

    static InsertConcept(concepts: Concept[], concept: Concept) {
        let low = 0;
        let high = concepts.length;
        const newName = concept.name.toLowerCase();

        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            const midName = concepts[mid].name.toLowerCase();

            if (midName < newName) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        concepts.splice(low, 0, concept);
    }
}