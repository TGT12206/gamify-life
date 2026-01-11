import { ArrayItemUI } from "ui-patterns/array-item-ui";
import { GamifyLifeView } from "../gamify-life-view";
import { MediaRenderer } from "ui-patterns/media-renderer";
import { MediaPathSuggest } from "../suggest/media-path-suggest";
import { TFile } from "obsidian";

export class MediaPathUI extends ArrayItemUI<string> {
    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: string[],
        itemAccess: { index: number },
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-div');
        div.classList.add('gl-scroll');
        if (itemAccess.index === 0) div.classList.add('gl-bordered');
        
        const index = itemAccess.index;
        const path = mainArray[index];

        const wrapperDiv = div.createDiv('vbox');
        const mediaInput = wrapperDiv.createEl('input', { type: 'text', value: path } );
        const mediaDiv = wrapperDiv.createDiv('hbox');

        this.MakeDeleteButton(view, div, mainArray, itemAccess, onRefresh);

        const selectPath = async (file: TFile) => {
            mainArray[index] = file.path;
            await onRefresh();
        }
        new MediaPathSuggest(mediaInput, mediaDiv, selectPath, view);

        try {
            view.mediaRenderer.renderMedia(mediaDiv, view, path);
        } catch {

        }
    }
}