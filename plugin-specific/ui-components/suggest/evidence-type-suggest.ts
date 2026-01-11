import { App, AbstractInputSuggest, prepareFuzzySearch } from 'obsidian';
import { EvidenceType, evidenceTypes } from 'plugin-specific/models/const';

export class EvidenceTypeSuggest extends AbstractInputSuggest<EvidenceType> {
    constructor(
        public inputEl: HTMLInputElement,
        app: App,
        public callback: (et: EvidenceType) => Promise<void> = async () => {}
    ) {
        super(app, inputEl);
    }

    getSuggestions(query: string): EvidenceType[] {
        const fuzzyMatcher = prepareFuzzySearch(query);
        return evidenceTypes
            .map(et => {
                const matchData = fuzzyMatcher(et);
                return { et: et, matchData: matchData };
            })
            .filter(result => result.matchData)
            .sort((a, b) => b.matchData!.score - a.matchData!.score)
            .map(result => result.et);
    }

    renderSuggestion(et: EvidenceType, el: HTMLElement): void {
        el.setText(et);
    }

    override async selectSuggestion(et: EvidenceType): Promise<void> {
        try {
            await this.callback(et);
            this.inputEl.value = et;
        } finally {
            this.close();
        }
    }
}