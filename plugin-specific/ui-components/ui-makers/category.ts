import { Notice } from "obsidian";
import { Concept } from "plugin-specific/models/concept";
import { BaseCategories } from "plugin-specific/models/const";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";

export class CategoryUIMaker extends ObjUIMaker<string> {
    get concept(): Concept {
        return <Concept> this.globalData;
    }
    set concept(newConcept: Concept) {
        this.globalData = newConcept;
    }

    constructor(concept: Concept) {
        super();
        this.concept = concept;
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
        
        const categoryInput = itemDiv.createEl('select');

        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        for (let i = 0; i < view.life.categories.length; i++) {
            const category = view.life.categories[i];
            categoryInput.createEl('option', { text: category.value, value: category.key } );
        }
        categoryInput.value = mainArray[index];

        view.registerDomEvent(categoryInput, 'change', async () => {
            if (mainArray.contains(categoryInput.value)) {
                // if this category was already chosen, reset it
                categoryInput.value = mainArray[index];
                new Notice('Category already chosen!');
                return;
            }
            const isBaseCategory = BaseCategories.contains(categoryInput.value);
            const alreadyHasBase = mainArray.some((category, i) => i !== index && BaseCategories.contains(category));
            if (isBaseCategory) {
                if (alreadyHasBase) {
                    categoryInput.value = mainArray[index];
                    new Notice('Can\'t have more than one base category!');
                    return;
                }
                mainArray[index] = categoryInput.value;
                await onSave();
                view.OpenCorrectConceptEditor(this.concept);
            }
            mainArray[index] = categoryInput.value;
            await onSave();
        });
    }
}