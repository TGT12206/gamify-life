import { HTMLHelper } from "ui-patterns/html-helper";
import { ListEditor } from "ui-patterns/list-editor";
import { Notice } from "obsidian";
import { MediaKeySuggest } from "plugin-specific/ui-components/suggest/media-key-suggest";
import { Life } from "plugin-specific/models/life";
import { GamifyLifeView } from "../gamify-life-view";
import { Describable } from "plugin-specific/models/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { KeyService } from "plugin-specific/services/key";
import { MediaRenderer } from "ui-patterns/media-renderer";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";

export class DescribableEditorUIMaker {
    constructor(public life: Life) {}

    MakeUI(
        view: GamifyLifeView,
        div: HTMLDivElement,
        describable: Describable
    ) {
        div.empty();
        div.className = 'vbox gl-scroll gl-outer-div gl-fill';
        this.MakeMediaListEditor(view, div.createDiv(), describable);
        this.MakeDescriptionEditor(view, div.createDiv(), describable);
    }
    
    MakeMediaListEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        describable: Describable
    ) {
        div.className = 'hbox';
        HTMLHelper.CreateNewTextDiv(div, 'Media:');
        const listEditor = new MediaOfDescribableListEditor(this.life, div.createDiv(), describable.mediaKeys, view.onSave);
        listEditor.Render(view);
    }

    MakeDescriptionEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        describable: Describable
    ) {
        div.empty();
        div.addClass('vbox'); 

        HTMLHelper.CreateNewTextDiv(div, 'Description');

        const input = div.createEl('textarea', {
            value: describable.description
        });
        input.className = 'gl-fill';

        view.registerDomEvent(input, 'change', async () => {
            describable.description = input.value;
            await view.onSave();
        });
    }
}
//#region Media
export class MediaOfDescribableUIMaker extends ObjUIMaker<string> {
    get life(): Life {
        return <Life> this.globalData;
    }
    set life(newLife: Life) {
        this.globalData = newLife;
    }

    constructor(life: Life) {
        super();
        this.life = life;
    }

    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: string[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        const shiftButtonsDiv = itemDiv.createDiv(this.isVertical ? 'hbox' : 'vbox');

        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'left' : 'up', onRefresh);
        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'right' : 'down', onRefresh);
        
        const path = mainArray[index];
        const mediaPathIndex = KeyService.FindKey(this.life.mediaPaths, path);
        const nonEmptyPath = mediaPathIndex > -1;
        let valOnLoad = ''
        if (nonEmptyPath) {
            const name = this.life.mediaPaths[mediaPathIndex].value;
            valOnLoad = name + '(' + path + ')';
        }

        const mediaInput = itemDiv.createEl('input', { type: 'text', value: valOnLoad } );
        const mediaDiv = itemDiv.createDiv('vbox');
        const open = itemDiv.createEl('button', { text: 'Open Link' } );

        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        const changeMediaKV = async (mediaKV: KeyValue<string>) => {
            mainArray[index] = mediaKV.key;
            await onSave();
        }
        new MediaKeySuggest(mediaInput, mediaDiv, this.life, changeMediaKV, view.app);

        if (nonEmptyPath) {
            MediaRenderer.renderMedia(mediaDiv, view.app.vault, path);
        }

        view.registerDomEvent(open, 'click', () => {
            const tFile = view.app.vault.getFileByPath(mainArray[index]);
            if (tFile === null) {
                return new Notice('File not found at ' + mainArray[index]);
            }
            view.app.workspace.getLeaf('tab').openFile(tFile);
        });
    }
}

export class MediaOfDescribableListEditor extends ListEditor<string> {
    constructor(life: Life, parentDiv: HTMLDivElement, mediaKeys: string[], onSave: () => Promise<void>) {
        const uiMaker = new MediaOfDescribableUIMaker(life);
        super(life, parentDiv, mediaKeys, () => { return '' }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}
//#endregion Media
