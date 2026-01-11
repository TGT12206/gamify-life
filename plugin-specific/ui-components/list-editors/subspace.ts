import { ArrayEditor } from "ui-patterns/array-editor";
import { GamifyLifeView } from "../gamify-life-view";
import { ItemOrSpace, SubspaceReference } from "plugin-specific/models/item-or-space";
import { SubspaceReferenceUI } from "../item-ui/subspace";
import { Concept } from "plugin-specific/models/concept";

export class SubspaceReferenceArrayEditor extends ArrayEditor<SubspaceReference> {
    constructor(root: ItemOrSpace, div: HTMLDivElement, view: GamifyLifeView) {
        const itemUI = new SubspaceReferenceUI(root);
        super(div, root.subspaces, itemUI);
        
        this.globalData = root;

        this.makeNewItem = () => { return { key: '', location: '' } };
        this.onSave = view.onSave;

        const life = view.life;

        this.simpleDisplayOrder = (a, b) => Concept.alphabeticComparisonByKeys(a.key, b.key, life);
        
        this.isVertical = false;
        this.itemsPerLine = 1;
        this.enableAddButton = true;
        this.indexedBased = false;

        itemUI.isVertical = true;

        this.Render(view);
    }
}