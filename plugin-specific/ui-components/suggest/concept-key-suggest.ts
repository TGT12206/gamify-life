import { App, AbstractInputSuggest, prepareFuzzySearch, SearchResult } from 'obsidian';
import { Concept } from 'plugin-specific/models/concept';
import { Life } from 'plugin-specific/models/life';
import { MapEntry } from 'ui-patterns/map-editor';

export class ConceptKeySuggest extends AbstractInputSuggest<MapEntry<string, Concept>> {
    constructor(
        public inputEl: HTMLInputElement,
        public life: Life,
        public root: Concept | null,
        app: App,
        public callback: (entry: MapEntry<string, Concept>) => Promise<void> = async () => {},
        /**
         * If this array is empty, all concepts will be accepted
         */
        public acceptedCategories: string[] = []
    ) {
        super(app, inputEl);
    }

    getSuggestions(query: string): MapEntry<string, Concept>[] {
        const fuzzyMatcher = prepareFuzzySearch(query);
        const entries = [...this.life.concepts.entries()];

        return entries
            .filter(entry => this.CheckIfMatch(entry[1]))
            .map(entry => {
                const concept = entry[1];
                const representation = concept.GetSearchRepresentation(this.life) ?? entry[0];
                const matchData = fuzzyMatcher(representation);

                return { entry: entry, matchData: matchData };
            })
            .filter(result => result.matchData)
            .sort((a, b) => b.matchData!.score - a.matchData!.score)
            .map(result => new MapEntry(result.entry[0], result.entry[1]));
    }

    protected CheckIfMatch(concept: Concept) {
        if (!this.CheckCategories(concept)) return false;
        if (this.CheckIfRecursive(concept)) return false;
        return true;
    }

    protected CheckCategories(concept: Concept) {
        if (this.acceptedCategories.length === 0) return true;
        
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

    renderSuggestion(entry: MapEntry<string, Concept>, el: HTMLElement): void {
        const name = entry.value.GetName(this.life);
        const fullDescription = entry.value.description;
        const displayDescription = fullDescription.length > 32 ? fullDescription.substring(0, 32) + '...' : fullDescription;

        el.setText(name + '\n\t' + displayDescription);
    }

    override async selectSuggestion(entry: MapEntry<string, Concept>): Promise<void> {
        try {
            await this.callback(entry);
            this.inputEl.value = entry.value.GetName(this.life) ?? 'Unnamed concept';
        } finally {
            this.close();
        }
    }
}