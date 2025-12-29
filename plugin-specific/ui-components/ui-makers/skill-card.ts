import { Concept } from "plugin-specific/models/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { Skill } from "plugin-specific/models/skill";

export class SkillCardUIMaker extends ObjUIMaker<Concept> {
    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: Concept[],
        index: number
    ): Promise<void> {
        const skill = <Skill> mainArray[index];
        itemDiv.classList.add('gl-bordered');
        itemDiv.classList.add('gl-fill');
        
        const nameButton = itemDiv.createEl('button', { text: skill.name } );
        view.skillEditorMaker.MakeProgressDisplay(view, itemDiv.createDiv(), skill);

        view.registerDomEvent(nameButton, 'click', () => {
            view.OpenCorrectConceptEditor(mainArray[index]);
        });
    }
}