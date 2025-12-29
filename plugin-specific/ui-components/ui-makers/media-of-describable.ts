import { Life } from "plugin-specific/models/life";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { KeyService } from "plugin-specific/services/key";
import { KeyValue } from "plugin-specific/models/key-value";
import { MediaKeySuggest } from "../suggest/media-key-suggest";
import { MediaRenderer } from "ui-patterns/media-renderer";
import { Notice } from "obsidian";

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
        const mediaDiv = itemDiv.createDiv('hbox');

        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        const changeMediaKV = async (mediaKV: KeyValue<string>) => {
            mainArray[index] = mediaKV.key;
            await onSave();
        }
        new MediaKeySuggest(mediaInput, mediaDiv, this.life, changeMediaKV, view);

        if (nonEmptyPath) {
            MediaRenderer.renderMedia(mediaDiv, view, path);
        }
    }
}