import { App, AbstractInputSuggest } from 'obsidian';
import { Concept } from 'plugin-specific/models/concept';
import { Life } from 'plugin-specific/models/life';

export class ConceptSuggest extends AbstractInputSuggest<Concept> {
    constructor(
        public inputEl: HTMLInputElement,
        public life: Life,
        public root: Concept | undefined,
        app: App,
        /**
         * If this array is empty, all concepts will be accepted
         */
        public callback: (concept: Concept) => Promise<void> = async () => {},
        public acceptedCategories: string[] = []
    ) {
        super(app, inputEl);
    }

    getSuggestions(inputStr: string): Concept[] {
        const pluginMediaFiles = [];
        const concepts = this.life.concepts;
        for (let i = 0; i < concepts.length; i++) {
            const currConcept = concepts[i];
            
            if (!this.CheckCategories(currConcept)) {
                continue;
            }

            if (this.CheckIfRecursive(currConcept)) {
                continue;
            }

            const currName = currConcept.name;
            const description = currConcept.description;

            let currConceptString = currName + '\n';
            for (let j = 0; j < currConcept.aliases.length; j++) {
                currConceptString += currConcept.aliases[j] + '\n';
            }
            currConceptString += description;
            if (currConceptString.toLowerCase().contains(inputStr.toLowerCase())) {
                pluginMediaFiles.push(currConcept);
            }
        }
        return pluginMediaFiles;
    }

    protected CheckCategories(concept: Concept) {
        if (this.acceptedCategories.length === 0) {
            return true;
        }

        const currCategories = concept.categoryKeys;

        let matchesCategory = false;
        for (let j = 0; !matchesCategory && j < currCategories.length; j++) {
            matchesCategory = this.acceptedCategories.contains(currCategories[j]);
        }
        return matchesCategory;
    }

    protected CheckIfRecursive(concept: Concept) {
        return concept === this.root;
    }

    renderSuggestion(concept: Concept, el: HTMLElement): void {
        const name = concept.name;
        const fullDescription = concept.description;
        const displayDescription = fullDescription.length > 32 ? fullDescription.substring(0, 32) + '...' : fullDescription;

        el.setText(name + '\n\t' + displayDescription);
    }

    override async selectSuggestion(concept: Concept): Promise<void> {
        try {
            await this.callback(concept);
            this.inputEl.value = concept.name;
        } finally {
            this.close();
        }
    }
}