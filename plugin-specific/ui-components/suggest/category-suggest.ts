import { App, AbstractInputSuggest, prepareFuzzySearch } from 'obsidian';
import { Life } from 'plugin-specific/models/life';

export class CategoryKeySuggest extends AbstractInputSuggest<string> {
    constructor(
        public inputEl: HTMLInputElement,
        app: App,
        public life: Life,
        public callback: (key: string) => Promise<void> = async () => {}
    ) {
        super(app, inputEl);
    }

    getSuggestions(query: string): string[] {
        const fuzzyMatcher = prepareFuzzySearch(query);
        return [...this.life.categories.entries()]
            .map(cat => {
                const matchData = fuzzyMatcher(cat[1]);
                return { key: cat[0], matchData: matchData };
            })
            .filter(result => result.matchData)
            .sort((a, b) => b.matchData!.score - a.matchData!.score)
            .map(result => result.key);
    }

    renderSuggestion(key: string, el: HTMLElement): void {
        el.setText(this.life.categories.get(key) ?? '');
    }

    override async selectSuggestion(key: string): Promise<void> {
        try {
            await this.callback(key);
            this.inputEl.value = this.life.categories.get(key) ?? '';
        } finally {
            this.close();
        }
    }
}