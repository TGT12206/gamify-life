import { ArrayItemUI } from "ui-patterns/array-item-ui";
import { GamifyLifeView } from "../gamify-life-view";

export class AliasUI extends ArrayItemUI<string> {
    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: string[],
        itemAccess: { index: number },
        onRefresh: (() => Promise<void>)
    ): Promise<void> {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-div');
        if (itemAccess.index === 0) div.classList.add('gl-bordered');

        const input = div.createEl('input', { type: 'text', value: mainArray[itemAccess.index] } );

        this.MakeDeleteButton(view, div, mainArray, itemAccess, onRefresh);

        view.registerDomEvent(input, 'change', async () => {
            mainArray[itemAccess.index] = input.value;
            await onRefresh();
        });
    }
}