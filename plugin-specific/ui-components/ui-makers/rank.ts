import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { ConceptService } from "plugin-specific/services/concept";
import { Rank } from "plugin-specific/models/skill";
import { KeyValue } from "plugin-specific/models/key-value";
import { ConceptKeySuggest } from "../suggest/concept-key-suggest";

export class RankUIMaker extends ObjUIMaker<string> {
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
        
        const rankInput = itemDiv.createEl('input', { type: 'text', value: ConceptService.GetNameFromKey(view.life, mainArray[index]) } );

        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        const updateRank = async (conceptKV: KeyValue<Rank>) => {
            mainArray[index] = conceptKV.key;
            await onSave();
        };
        new ConceptKeySuggest(rankInput, view.life, undefined, view.app, updateRank, ['Skill Rank']);
    }
}