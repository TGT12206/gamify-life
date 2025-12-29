import { MediaRenderer } from 'ui-patterns/media-renderer';
import {AbstractInputSuggest, TFile, View} from 'obsidian';

export class MediaPathSuggest extends AbstractInputSuggest<TFile> {
    private get vault() {
        return this.app.vault;
    }
    private renderMedia: (path: string) => Promise<void>;

    constructor(
        public inputEl: HTMLInputElement,
        public mediaDiv: HTMLDivElement,
        public callback: (value: TFile) => void,
        view: View
    ) {
        super(view.app, inputEl);
        this.renderMedia = async (path: string) => {
            await MediaRenderer.renderMedia(this.mediaDiv, view, path);
        }
    }

    getSuggestions(inputStr: string): TFile[] {
        const allFiles = this.vault.getFiles();
        for (let i = 0; i < allFiles.length; i++) {
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
            await this.renderMedia(file.path);
            this.inputEl.value = file.path;
        } finally {
            this.close();
        }
    }
}