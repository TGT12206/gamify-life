import { ArrayItemUI } from "ui-patterns/array-item-ui";
import { GamifyLifeView } from "../gamify-life-view";
import { Tab } from "../tab-handler";
import { HTMLHelper } from "ui-patterns/html-helper";

export class TabButtonUI extends ArrayItemUI<{ el: HTMLElement, data: Tab }> {
    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: { el: HTMLElement, data: Tab }[],
        itemAccess: { index: number },
        onRefresh: (() => Promise<void>)
    ): Promise<void> {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-div');
        div.classList.add('gl-bordered');

        const item = mainArray[itemAccess.index];
        item.el = div;
        const tabName = HTMLHelper.CreateNewTextDiv(div, 'Tab ' + itemAccess.index);
        tabName.classList.add('pointer-hover');

        this.MakeDeleteButton(view, div, mainArray, itemAccess, onRefresh);

        view.registerDomEvent(tabName, 'click', () => {
            view.setActiveTab(itemAccess.index);
        });
    }
}