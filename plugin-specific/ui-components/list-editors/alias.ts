import { ArrayEditor } from "ui-patterns/array-editor";
import { GamifyLifeView } from "../gamify-life-view";
import { AliasUI } from "../item-ui/alias";

export class AliasArrayEditor extends ArrayEditor<string> {
    constructor(div: HTMLDivElement, aliases: string[], view: GamifyLifeView) {
        const itemUI = new AliasUI();
        super(div, aliases, itemUI);
        
        this.makeNewItem = () => '';
        this.onSave = view.onSave;

        this.simpleDisplayOrder = (a, b) => { return a < b ? -1 : a > b ? 1 : 0 };
        
        this.isVertical = false;
        this.itemsPerLine = 1;
        this.enableAddButton = true;
        this.indexedBased = true;

        itemUI.isVertical = false;

        this.Render(view);
    }
}