import { ArrayEditor } from "ui-patterns/array-editor";
import { GamifyLifeView } from "../gamify-life-view";
import { EarnedSkillUnitUI } from "../item-ui/earned-skill-unit";
import { Moment } from "plugin-specific/models/moment";
import { EarnedSkillUnit } from "plugin-specific/models/skill";

export class EarnedSkillUnitArrayEditor extends ArrayEditor<EarnedSkillUnit> {
    constructor(moment: Moment, div: HTMLDivElement, view: GamifyLifeView) {
        const itemUI = new EarnedSkillUnitUI(moment);
        super(div, moment.skillUnitsEarned, itemUI);
        
        this.globalData = moment;

        this.makeNewItem = () => new EarnedSkillUnit();
        this.onSave = view.onSave;
        
        this.isVertical = false;
        this.itemsPerLine = 1;
        this.enableAddButton = true;
        this.indexedBased = true;

        itemUI.isVertical = true;

        this.Render(view);
    }
}