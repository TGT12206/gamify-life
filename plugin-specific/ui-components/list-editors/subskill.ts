import { ArrayEditor } from "ui-patterns/array-editor";
import { GamifyLifeView } from "../gamify-life-view";
import { SubskillReferenceUI } from "../item-ui/subskill";
import { Skill, SubskillReference } from "plugin-specific/models/skill";
import { Concept } from "plugin-specific/models/concept";

export class SubskillReferenceArrayEditor extends ArrayEditor<SubskillReference> {
    constructor(root: Skill, div: HTMLDivElement, view: GamifyLifeView) {
        const itemUI = new SubskillReferenceUI(root);
        super(div, root.subskills, itemUI);
        
        this.globalData = root;

        this.makeNewItem = () => { return { key: '', weight: 1 } };
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