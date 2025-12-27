import { Concept } from "plugin-specific/models/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { Skill } from "plugin-specific/models/skill";

export class SkillCardUIMaker extends ObjUIMaker<KeyValue<Concept>> {
    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: KeyValue<Concept>[],
        index: number
    ): Promise<void> {
        const skill = <Skill> mainArray[index].value;
        itemDiv.classList.add('gl-bordered');
        itemDiv.classList.add('gl-fit-content');
        
        const nameButton = itemDiv.createEl('button', { text: skill.name } );
        view.skillEditorMaker.MakeProgressDisplay(view, itemDiv.createDiv(), skill);

        view.registerDomEvent(nameButton, 'click', () => {
            view.OpenCorrectConceptEditor(mainArray[index].value);
        });
    }
}