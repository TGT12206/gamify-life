import { MediaRenderer } from 'ui-patterns/media-renderer';
import {App, AbstractInputSuggest, TFile} from 'obsidian';

export class MediaPathSuggest extends AbstractInputSuggest<TFile> {
    private get vault() {
        return this.app.vault;
    }

    constructor(
        public inputEl: HTMLInputElement,
        public mediaDiv: HTMLDivElement,
        public callback: (value: TFile) => void,
        app: App
    ) {
        super(app, inputEl);
    }

    getSuggestions(inputStr: string): TFile[] {
        const allFiles = this.vault.getFiles();
        for (let i = allFiles.length - 1; i >= 0; i--) {
            const currFile = allFiles[i];
            if (!(
                    (MediaRenderer.isImage(currFile.extension) ||
                    MediaRenderer.isVideo(currFile.extension) ||
                    MediaRenderer.isAudio(currFile.extension))
                    &&
                    currFile.path.toLowerCase().contains(inputStr.toLowerCase())
                )
            ) {
                allFiles.splice(i, 1);
            }
        }
        return allFiles;
    }

    renderSuggestion(file: TFile, el: HTMLElement): void {
        el.setText(file.path);
    }

    override async selectSuggestion(file: TFile, evt: MouseEvent | KeyboardEvent): Promise<void> {
        try {
            this.callback(file);
            await MediaRenderer.renderMedia(this.mediaDiv, this.vault, file.path);
            this.inputEl.value = file.path;
        } finally {
            this.close();
        }
    }
}