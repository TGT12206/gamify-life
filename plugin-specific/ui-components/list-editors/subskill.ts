import { Skill } from "plugin-specific/models/skill";
import { ListEditor } from "ui-patterns/list-editor";
import { SubskillUIMaker } from "../ui-makers/subskill";

export class SubskillListEditor extends ListEditor<{ name: string, weight: number }> {
    constructor(root: Skill, parentDiv: HTMLDivElement, subskills: { name: string, weight: number }[], onSave: () => Promise<void>) {
        const uiMaker = new SubskillUIMaker();
        super(root, parentDiv, subskills, () => { return { name: '', weight: 0 } }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}