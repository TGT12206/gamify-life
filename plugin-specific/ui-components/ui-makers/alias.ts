import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";

export class AliasUIMaker extends ObjUIMaker<string> {
    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: string[],
        index: number,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        const shiftButtonsDiv = itemDiv.createDiv(this.isVertical ? 'hbox' : 'vbox');

        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'left' : 'up', onRefresh);
        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'right' : 'down', onRefresh);
        
        const aliasInput = itemDiv.createEl('input', { type: 'text', value: mainArray[index] } );

        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        view.registerDomEvent(aliasInput, 'change', async () => {
            mainArray[index] = aliasInput.value;
            await view.onSave();
        });
    }
}