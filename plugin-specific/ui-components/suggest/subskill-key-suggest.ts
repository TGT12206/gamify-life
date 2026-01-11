import { App } from 'obsidian';
import { Concept } from 'plugin-specific/models/concept';
import { Life } from 'plugin-specific/models/life';
import { Skill } from 'plugin-specific/models/skill';
import { ConceptKeySuggest } from './concept-key-suggest';
import { MapEntry } from 'ui-patterns/map-editor';

export class SubskillKeySuggest extends ConceptKeySuggest {
    constructor(
        public inputEl: HTMLInputElement,
        public life: Life,
        public root: Skill,
        app: App,
        public callback: (entry: MapEntry<string, Skill>) => Promise<void> = async () => {}
    ) {
        super(inputEl, life, root, app, callback, ['Skill']);
    }

    protected override CheckCategories(concept: Concept) {
        return concept.baseCategory === 'Skill';
    }

    protected override CheckIfRecursive(concept: Concept) {
        if (concept === this.root) return true;

        const skill = <Skill> concept;

        for (let i = 0; i < skill.subskills.length; i++) {
            const subskillKey = skill.subskills[i].key;
            const subskill = this.life.concepts.get(subskillKey);
            
            if (subskill !== undefined) {
                if (this.CheckIfRecursive(subskill)) {
                    return true;
                }
            }
        }

        return false;
    }
}