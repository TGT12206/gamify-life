import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { ConceptKeySuggest } from "../suggest/concept-key-suggest";
import { Concept } from "plugin-specific/models/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { ConceptService } from "plugin-specific/services/concept";

export class ConceptKeyUIMaker extends ObjUIMaker<string> {
    get root(): Concept | undefined {
        return <Concept | undefined> this.globalData;
    }
    set root(newRoot: Concept | undefined) {
        this.globalData = newRoot;
    }

    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: string[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        const shiftButtonsDiv = itemDiv.createDiv(this.isVertical ? 'hbox' : 'vbox');

        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'left' : 'up', onRefresh);
        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'right' : 'down', onRefresh);
        
        const input = itemDiv.createEl('input', { type: 'text', value: ConceptService.GetNameFromKey(view.life, mainArray[index]) } );

        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        const updateKey = async (conceptKV: KeyValue<Concept>) => {
            mainArray[index] = conceptKV.key;
            await onSave();
        };
        new ConceptKeySuggest(input, view.life, this.root, view.app, updateKey);
    }
}