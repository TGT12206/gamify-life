import { ArrayEditor } from "ui-patterns/array-editor";
import { ConceptKeyUI } from "../item-ui/concept-key";
import { GamifyLifeView } from "../gamify-life-view";
import { Claim } from "plugin-specific/models/claim";
import { Moment } from "plugin-specific/models/moment";
import { Concept } from "plugin-specific/models/concept";

export class ConceptKeyArrayEditor extends ArrayEditor<string> {
    constructor(root: Claim | Moment, div: HTMLDivElement, view: GamifyLifeView) {
        const itemUI = new ConceptKeyUI(root);
        super(div, root.conceptKeys, itemUI);
        
        this.globalData = root;

        this.makeNewItem = () => '';
        this.onSave = view.onSave;

        const life = view.life;

        this.simpleDisplayOrder = (a, b) => Concept.alphabeticComparisonByKeys(a, b, life);
        
        this.isVertical = false;
        this.itemsPerLine = 1;
        this.enableAddButton = true;
        this.indexedBased = true;

        itemUI.isVertical = true;

        this.Render(view);
    }
}