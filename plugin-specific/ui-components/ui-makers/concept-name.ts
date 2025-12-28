import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { ConceptSuggest } from "../suggest/concept-suggest";
import { Concept } from "plugin-specific/models/concept";

export class ConceptNameUIMaker extends ObjUIMaker<string> {
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
        
        const input = itemDiv.createEl('input', { type: 'text', value: mainArray[index] } );

        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        const updateName = async (concept: Concept) => {
            mainArray[index] = concept.name;
            await onSave();
        };
        new ConceptSuggest(input, view.life, this.root, view.app, updateName);
    }
}