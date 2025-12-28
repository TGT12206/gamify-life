import { Skill } from "plugin-specific/models/skill";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { ConceptService } from "plugin-specific/services/concept";
import { Concept } from "plugin-specific/models/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { SubskillSuggest } from "../suggest/subskill-key-suggest";

export class SubskillUIMaker extends ObjUIMaker<{ name: string, weight: number }> {
    get root(): Skill {
        return <Skill> this.globalData;
    }
    set root(newRoot: Skill) {
        this.globalData = newRoot;
    }

    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: { name: string, weight: number }[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        const shiftButtonsDiv = itemDiv.createDiv(this.isVertical ? 'hbox' : 'vbox');

        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'left' : 'up', onRefresh);
        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'right' : 'down', onRefresh);
        
        const keyInput = itemDiv.createEl('input', { type: 'text', value: mainArray[index].name } );
        const weightInput = itemDiv.createEl('input', { type: 'number', value: mainArray[index].weight + '' } );
        
        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        const updateKey = async (concept: Concept) => {
            mainArray[index].name = concept.name;
            await onSave();
        };
        new SubskillSuggest(keyInput, view.life, this.root, view.app, updateKey);

        view.registerDomEvent(weightInput, 'change', async () => {
            mainArray[index].weight = parseFloat(weightInput.value);
            await onSave();
        });
    }
}