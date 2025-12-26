import { App, AbstractInputSuggest } from 'obsidian';
import { Concept } from 'plugin-specific/models/concept';
import { KeyValue } from 'plugin-specific/models/key-value';
import { Life } from 'plugin-specific/models/life';

export class ConceptKeySuggest extends AbstractInputSuggest<KeyValue<Concept>> {
    constructor(
        public inputEl: HTMLInputElement,
        public life: Life,
        public root: Concept | undefined,
        app: App,
        /**
         * If this array is empty, all concepts will be accepted
         */
        public callback: (conceptKV: KeyValue<Concept>) => Promise<void> = async () => {},
        public acceptedCategories: string[] = []
    ) {
        super(app, inputEl);
    }

    getSuggestions(inputStr: string): KeyValue<Concept>[] {
        const pluginMediaFiles = [];
        const conceptKVs = this.life.concepts;
        for (let i = conceptKVs.length - 1; i >= 0; i--) {
            const currConceptKV = conceptKVs[i];
            
            if (!this.CheckCategories(currConceptKV)) {
                continue;
            }

            if (this.CheckIfRecursive(currConceptKV)) {
                continue;
            }

            const currKey = currConceptKV.key;
            const currName = currConceptKV.value.name;
            const description = currConceptKV.value.description;

            const currConceptString = currName + '(' + currKey + ') ' + description;
            if (currConceptString.contains(inputStr)) {
                pluginMediaFiles.push(currConceptKV);
            }
        }
        return pluginMediaFiles;
    }

    protected CheckCategories(conceptKV: KeyValue<Concept>) {
        if (this.acceptedCategories.length === 0) {
            return true;
        }

        const currCategories = conceptKV.value.categoryKeys;

        let matchesCategory = false;
        for (let j = 0; !matchesCategory && j < currCategories.length; j++) {
            matchesCategory = this.acceptedCategories.contains(currCategories[j]);
        }
        return matchesCategory;
    }

    protected CheckIfRecursive(conceptKV: KeyValue<Concept>) {
        return conceptKV.value === this.root;
    }

    renderSuggestion(conceptKV: KeyValue<Concept>, el: HTMLElement): void {
        const key = conceptKV.key;
        const name = conceptKV.value.name;
        const fullDescription = conceptKV.value.description;
        const displayDescription = fullDescription.length > 32 ? fullDescription.substring(0, 32) + '...' : fullDescription;

        el.setText(name + ' (' + key + ')' + '\n\t' + displayDescription);
    }

    override async selectSuggestion(conceptKV: KeyValue<Concept>): Promise<void> {
        try {
            await this.callback(conceptKV);
            this.inputEl.value = conceptKV.value.name;
        } finally {
            this.close();
        }
    }
}