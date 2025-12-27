import { Skill } from "plugin-specific/models/skill";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { ConceptService } from "plugin-specific/services/concept";
import { Concept } from "plugin-specific/models/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { SubskillKeySuggest } from "../suggest/subskill-key-suggest";

export class SubskillUIMaker extends ObjUIMaker<{ key: string, weight: number }> {
    get root(): Skill {
        return <Skill> this.globalData;
    }
    set root(newRoot: Skill) {
        this.globalData = newRoot;
    }

    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: { key: string, weight: number }[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        const shiftButtonsDiv = itemDiv.createDiv(this.isVertical ? 'hbox' : 'vbox');

        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'left' : 'up', onRefresh);
        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'right' : 'down', onRefresh);
        
        const keyInput = itemDiv.createEl('input', { type: 'text', value: ConceptService.GetNameFromKey(view.life, mainArray[index].key) } );
        const weightInput = itemDiv.createEl('input', { type: 'number', value: mainArray[index].weight + '' } );
        
        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        const updateKey = async (conceptKV: KeyValue<Concept>) => {
            mainArray[index].key = conceptKV.key;
            await onSave();
        };
        new SubskillKeySuggest(keyInput, view.life, this.root, view.app, updateKey);

        view.registerDomEvent(weightInput, 'change', async () => {
            mainArray[index].weight = parseFloat(weightInput.value);
            await onSave();
        });
    }
}