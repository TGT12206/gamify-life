import { App, AbstractInputSuggest } from 'obsidian';
import { Concept } from 'plugin-specific/models/concept';
import { KeyValue } from 'plugin-specific/models/key-value';
import { Life } from 'plugin-specific/models/life';
import { Skill } from 'plugin-specific/models/skill';
import { KeyService } from 'plugin-specific/services/key';
import { ConceptKeySuggest } from './concept-key-suggest';

export class SubskillKeySuggest extends ConceptKeySuggest {
    constructor(
        public inputEl: HTMLInputElement,
        public life: Life,
        public root: Skill,
        app: App,
        public callback: (conceptKV: KeyValue<Concept>) => Promise<void> = async () => {}
    ) {
        super(inputEl, life, root, app, callback, ['Skill']);
    }

    protected override CheckCategories(conceptKV: KeyValue<Concept>) {
        const currCategories = conceptKV.value.categoryKeys;
        return currCategories.contains('Skill');
    }

    protected override CheckIfRecursive(conceptKV: KeyValue<Concept>) {
        if (conceptKV.value === this.root) return true;

        const concept = conceptKV.value;
        const skill = <Skill> concept;

        for (const subskillKey of skill.subskills) {
            const subskillKV = KeyService.Get(this.life.concepts, subskillKey.key);
            
            if (subskillKV !== undefined) {
                if (this.CheckIfRecursive(subskillKV)) {
                    return true;
                }
            }
        }

        return false;
    }
}