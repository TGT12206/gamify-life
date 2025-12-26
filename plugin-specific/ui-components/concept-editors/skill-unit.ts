import { Concept } from "plugin-specific/models/concept";
import { GamifyLifeView } from "../gamify-life-view";
import { ConceptEditorUIMaker } from "./concept";
import { HTMLHelper } from "ui-patterns/html-helper";
import { SkillUnit } from "plugin-specific/models/skill";

export class SkillUnitEditorUIMaker extends ConceptEditorUIMaker {
    override MakeUI(view: GamifyLifeView, div: HTMLDivElement, concept: Concept) {
        super.MakeUI(view, div, concept);
        this.MakeDefaultCheckbox(view, div.createDiv(), <SkillUnit> concept);
    }

    protected MakeDefaultCheckbox(view: GamifyLifeView, div: HTMLDivElement, skillUnit: SkillUnit) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Use default behavior? (hrs spent):');
        const checkbox = div.createEl('input', { type: 'checkbox' } );
        checkbox.checked = skillUnit.isHoursSpent;
        view.registerDomEvent(checkbox, 'click', async () => {
            skillUnit.isHoursSpent = checkbox.checked;
            await view.onSave();
        });
    }
}