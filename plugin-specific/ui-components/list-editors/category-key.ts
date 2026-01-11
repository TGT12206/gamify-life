import { Concept } from "plugin-specific/models/concept";
import { ArrayEditor } from "ui-patterns/array-editor";
import { GamifyLifeView } from "../gamify-life-view";
import { CategoryKeyUI } from "../item-ui/category-key";

export class CategoryKeyArrayEditor extends ArrayEditor<string> {
    constructor(concept: Concept, div: HTMLDivElement, view: GamifyLifeView) {
        const itemUI = new CategoryKeyUI(concept);
        super(div, concept.categoryKeys, itemUI);
        
        this.globalData = concept;
        
        this.makeNewItem = () => '';
        this.onSave = view.onSave;

        const bc = concept.baseCategory;
        this.simpleDisplayOrder = (a, b) => {
            if (a === bc) return -1;
            if (b === bc) return 1;
            return a.localeCompare(b, undefined, { numeric: true });
        };
        
        this.isVertical = false;
        this.itemsPerLine = 1;
        this.enableAddButton = true;
        this.indexedBased = true;

        itemUI.isVertical = false;

        this.Render(view);
    }
}