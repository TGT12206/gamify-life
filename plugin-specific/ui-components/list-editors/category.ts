import { GamifyLifeView } from "../gamify-life-view";
import { GenerateUniqueStringKey, MapEditor, MapEntry } from "ui-patterns/map-editor";
import { CategoryUI } from "../item-ui/category";

export class CategoryList extends MapEditor<string, string> {
    constructor(div: HTMLDivElement, view: GamifyLifeView) {
        const itemUI = new CategoryUI();
        super(div, view.life.categories, itemUI);

        this.makeNewEntry = () => {
            const key = GenerateUniqueStringKey();
            const value = '';
            return new MapEntry(key, value);
        };
        this.onSave = view.onSave;
        
        this.simpleDisplayOrder = (a, b) => { return a.value.localeCompare(b.value, undefined, { numeric: true }) };
        
        this.isVertical = true;
        this.itemsPerLine = 5;
        this.enableAddButton = true;
        this.keyBased = true;

        itemUI.isVertical = true;

        this.Render(view);
    }
}