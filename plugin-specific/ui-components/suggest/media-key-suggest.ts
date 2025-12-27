import {App, AbstractInputSuggest, TFile, Notice} from 'obsidian';
import { KeyValue } from 'plugin-specific/models/key-value';
import { Life } from 'plugin-specific/models/life';
import { MediaRenderer } from 'ui-patterns/media-renderer';

export class MediaKeySuggest extends AbstractInputSuggest<KeyValue<string>> {
    private get vault() {
        return this.app.vault;
    }

    constructor(
        public inputEl: HTMLInputElement,
        public mediaDiv: HTMLDivElement,
        public life: Life,
        public callback: (mediaKV: KeyValue<string>) => Promise<void>,
        app: App
    ) {
        super(app, inputEl);
    }

    getSuggestions(inputStr: string): KeyValue<string>[] {
        const pluginMediaFiles = [];
        const pluginMediaPathKVs = this.life.mediaPaths;
        for (let i = pluginMediaPathKVs.length - 1; i >= 0; i--) {
            const currFileKV = pluginMediaPathKVs[i];
            const currFilePath = currFileKV.key;
            const currFileAlias = currFileKV.value;
            const currFileString = currFileAlias + '(' + currFilePath + ')';
            if (currFileString.toLowerCase().contains(inputStr.toLowerCase())) {
                pluginMediaFiles.push(currFileKV);
            }
        }
        return pluginMediaFiles;
    }

    renderSuggestion(mediaKV: KeyValue<string>, el: HTMLElement): void {
        el.setText(mediaKV.value + ' (' + mediaKV.key + ')');
    }

    override async selectSuggestion(mediaKV: KeyValue<string>, evt: MouseEvent | KeyboardEvent): Promise<void> {
        try {
            await this.callback(mediaKV);
            await MediaRenderer.renderMedia(this.mediaDiv, this.vault, mediaKV.key);
            this.inputEl.value = mediaKV.value;
        } finally {
            this.close();
        }
    }
}