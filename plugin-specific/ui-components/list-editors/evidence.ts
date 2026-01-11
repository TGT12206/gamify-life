import { Concept } from "plugin-specific/models/concept";
import { ArrayEditor } from "ui-patterns/array-editor";
import { GamifyLifeView } from "../gamify-life-view";
import { Evidence } from "plugin-specific/models/claim";
import { EvidenceUI } from "../item-ui/evidence";

export class EvidenceArrayEditor extends ArrayEditor<Evidence> {
    constructor(root: Concept | null, div: HTMLDivElement, evidenceList: Evidence[], view: GamifyLifeView) {
        const itemUI = new EvidenceUI(root);
        super(div, evidenceList, itemUI);
        
        this.globalData = root;

        this.makeNewItem = () => new Evidence();
        this.onSave = view.onSave;

        // Sort by the strongest evidence (for or against) first
        this.simpleDisplayOrder = (a, b) => {
            const aStr = Math.abs(a.supportingStrength);
            const bStr = Math.abs(b.supportingStrength);
            return bStr - aStr;
        };
        
        this.isVertical = false;
        this.itemsPerLine = 1;
        this.enableAddButton = true;
        this.indexedBased = false;

        itemUI.isVertical = true;

        this.Render(view);
    }
}