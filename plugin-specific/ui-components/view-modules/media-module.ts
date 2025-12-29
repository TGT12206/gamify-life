import { HTMLHelper } from "ui-patterns/html-helper";
import { ItemView, Notice, TFile } from "obsidian";
import { MediaPathSuggest } from "plugin-specific/ui-components/suggest/media-path-suggest";
import { MediaRenderer } from "ui-patterns/media-renderer";
import { GamifyLifeView } from "../gamify-life-view";
import { Life } from "plugin-specific/models/life";
import { KeyValueListEditor, KeyValueUIMaker } from "./module";
import { KeyValue } from "plugin-specific/models/key-value";
import { MediaKeyService } from "plugin-specific/services/media-key";

export function DisplayMediaModule(view: GamifyLifeView, life: Life, div: HTMLDivElement) {
    div.className = 'gl-scroll gl-fill gl-outer-div vbox';
    HTMLHelper.CreateNewTextDiv(div, 'Gallery of media');
    const listEditor = new MediaKVListEditor(
        life, div.createDiv(), life.mediaPaths, view.onSave
    );
    listEditor.Render(view);
}

class MediaKVUIMaker extends KeyValueUIMaker<string> {
    protected override DeleteKey(index: number): void | Promise<void> {
        MediaKeyService.DeleteMediaKey(this.life, index);
    }
    protected override ChangeKey(index: number, newKey: string): void | Promise<void> {
        MediaKeyService.ChangeMediaKey(this.life, index, newKey);
    }
    protected override async MakeKeyUI(view: ItemView, keyDiv: HTMLDivElement, mainArray: KeyValue<string>[], index: number, onSave: () => Promise<void>, onRefresh: () => Promise<void>): Promise<void> {
        keyDiv.classList.add('hbox');
        HTMLHelper.CreateNewTextDiv(keyDiv, 'Path in vault');
        const pathInput = keyDiv.createEl('input', { type: 'text', value: mainArray[index].key } );
        const mediaDiv = keyDiv.createDiv('hbox');
        
        const changePath = async (file: TFile) => {
            try {
                this.ChangeKey(index, file.path);
                mainArray[index].key = file.path;
                await onSave();
            } catch {
                pathInput.value = mainArray[index].key;
            }
        }
        new MediaPathSuggest(pathInput, mediaDiv, async (file: TFile) => { await changePath(file); }, view);
        MediaRenderer.renderMedia(mediaDiv, view, mainArray[index].key);
    }
    protected override async MakeValueUI(view: ItemView, valueDiv: HTMLDivElement, mainArray: KeyValue<string>[], index: number, onSave: () => Promise<void>, onRefresh: () => Promise<void>): Promise<void> {
        valueDiv.classList.add('hbox');
        HTMLHelper.CreateNewTextDiv(valueDiv, 'Name');
        const nameInput = valueDiv.createEl('input', { type: 'text', value: mainArray[index].value } );
        
        view.registerDomEvent(nameInput, 'change', async () => {
            try {
                this.ChangeValue(mainArray, index, nameInput.value);
                mainArray[index].value = nameInput.value;
                await onSave();
            } catch {
                nameInput.value = mainArray[index].value;
            }
        });
    }
}

class MediaKVListEditor extends KeyValueListEditor<string> {
    constructor(
        life: Life,
        parentDiv: HTMLDivElement,
        mainArray: KeyValue<string>[],
        onSave: () => Promise<void>
    ) {
        const uiMaker = new MediaKVUIMaker(life);
        super(life, parentDiv, mainArray, () => { return new KeyValue<string>('', '') } , uiMaker, onSave);
        this.defaultValue = '';
        this.isVertical = true;
        uiMaker.isVertical = false;
    }
}