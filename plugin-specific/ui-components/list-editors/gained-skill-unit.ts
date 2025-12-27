import { Moment } from "plugin-specific/models/moment";
import { GainedSkillUnit } from "plugin-specific/models/skill";
import { ListEditor } from "ui-patterns/list-editor";
import { GainedSkillUnitUIMaker } from "../ui-makers/gained-skill-unit";

export class GainedSkillUnitListEditor extends ListEditor<GainedSkillUnit> {
    constructor(moment: Moment, parentDiv: HTMLDivElement, gainedSkillUnits: GainedSkillUnit[], onSave: () => Promise<void>) {
        const uiMaker = new GainedSkillUnitUIMaker();
        super(moment, parentDiv, gainedSkillUnits, () => { return new GainedSkillUnit() }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}