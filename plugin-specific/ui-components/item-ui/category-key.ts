import { Notice } from "obsidian";
import { Concept } from "plugin-specific/models/concept";
import { baseCategories } from "plugin-specific/models/const";
import { ArrayItemUI } from "ui-patterns/array-item-ui";
import { GamifyLifeView } from "../gamify-life-view";
import { CategoryKeySuggest } from "../suggest/category-suggest";

export class CategoryKeyUI extends ArrayItemUI<string> {
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

    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: string[],
        itemAccess: { index: number },
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-div');
        
        const index = itemAccess.index;
        if (baseCategories.some(bc => bc === mainArray[index])) div.classList.add('gl-bordered');
        
        const input = div.createEl('input', { type: 'text' } );
        this.MakeDeleteButton(view, div, mainArray, itemAccess, onRefresh);

        input.value = mainArray[index];

        const selectCategory = async (key: string) => {
            if (mainArray.contains(key)) {
                // if this category was already chosen, reset it
                input.value = mainArray[index];
                new Notice('Category already chosen!');
                return;
            }
            const isBaseCategory = baseCategories.some(bc => bc === key);
            const alreadyHasBase = this.concept.baseCategory !== undefined;
            if (isBaseCategory) {
                if (alreadyHasBase) {
                    input.value = mainArray[index];
                    new Notice('Can\'t have more than one base category!');
                    return;
                }
                mainArray[index] = key;
                if (onSave !== null) await onSave();
                return view.OpenCorrectConceptLoader(this.concept);
            }
            mainArray[index] = key;
            await onRefresh();
        };
        new CategoryKeySuggest(input, view.app, view.life, selectCategory);
    }
}