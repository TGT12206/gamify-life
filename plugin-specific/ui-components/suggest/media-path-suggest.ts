import { MediaRenderer } from 'ui-patterns/media-renderer';
import { AbstractInputSuggest, prepareFuzzySearch, TFile } from 'obsidian';
import { GamifyLifeView } from '../gamify-life-view';

export class MediaPathSuggest extends AbstractInputSuggest<TFile> {
    private get vault() {
        return this.app.vault;
    }
    private renderMedia: (path: string) => Promise<void>;

    constructor(
        public inputEl: HTMLInputElement,
        public mediaDiv: HTMLDivElement,
        public callback: (value: TFile) => void,
        view: GamifyLifeView
    ) {
        super(view.app, inputEl);
        this.renderMedia = async (path: string) => {
            await view.mediaRenderer.renderMedia(this.mediaDiv, view, path);
        }
    }

    getSuggestions(inputStr: string): TFile[] {
        const fuzzyMatcher = prepareFuzzySearch(inputStr);
        const allFiles = this.vault.getFiles();
        return allFiles.map(file => {
                const result = fuzzyMatcher(file.path);
                return result ? { file, score: result.score, matches: result.matches } : null;
            })
            .filter(result => result !== null)
            .sort((a, b) => b.score - a.score)
            .map(result => result.file);
    }

    renderSuggestion(file: TFile, el: HTMLElement): void {
        el.setText(file.path);
    }

    override async selectSuggestion(file: TFile, evt: MouseEvent | KeyboardEvent): Promise<void> {
        try {
            this.callback(file);
            await this.renderMedia(file.path);
            this.inputEl.value = file.path;
        } finally {
            this.close();
        }
    }
}