import { App, AbstractInputSuggest } from 'obsidian';
import { Concept } from 'plugin-specific/models/concept';
import { Life } from 'plugin-specific/models/life';
import { Skill } from 'plugin-specific/models/skill';
import { KeyService } from 'plugin-specific/services/key';
import { ConceptSuggest } from './concept-suggest';
import { ConceptService } from 'plugin-specific/services/concept';

export class SubskillSuggest extends ConceptSuggest {
    constructor(
        public inputEl: HTMLInputElement,
        public life: Life,
        public root: Skill,
        app: App,
        public callback: (concept: Concept) => Promise<void> = async () => {}
    ) {
        super(inputEl, life, root, app, callback, ['Skill']);
    }

    protected override CheckCategories(concept: Concept) {
        const currCategories = concept.categoryKeys;
        return currCategories.contains('Skill');
    }

    protected override CheckIfRecursive(concept: Concept) {
        if (concept === this.root) return true;

        const skill = <Skill> concept;

        for (let i = 0; i < skill.subskills.length; i++) {
            const subskillName = skill.subskills[i].name;
            const subskill = ConceptService.GetConceptByName(this.life, subskillName);
            
            if (subskill !== undefined) {
                if (this.CheckIfRecursive(subskill)) {
                    return true;
                }
            }
        }

        return false;
    }
}