import { ArrayEditor } from "ui-patterns/array-editor";
import { GamifyLifeView } from "../gamify-life-view";
import { Tab } from "../tab-handler";
import { TabButtonUI } from "../item-ui/tab";

export class TabButtonArrayEditor extends ArrayEditor<{ el: HTMLElement, data: Tab }> {
    constructor(div: HTMLDivElement, tabs: { el: HTMLElement, data: Tab }[], view: GamifyLifeView) {
        const itemUI = new TabButtonUI();
        super(div, tabs, itemUI);
        
        this.makeNewItem = () => { return { el: this.listDiv.createDiv(), data: new Tab() } };
        
        this.isVertical = false;
        this.itemsPerLine = 1;
        this.enableAddButton = true;
        this.indexedBased = true;

        itemUI.isVertical = false;

        this.Render(view);
    }
    override async RefreshList(view: GamifyLifeView) {
        await super.RefreshList(view);
        view.setActiveTab(view.currentTabIndex);
    }
}