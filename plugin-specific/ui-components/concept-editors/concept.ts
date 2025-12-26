import { HTMLHelper } from "ui-patterns/html-helper";
import { ListEditor } from "ui-patterns/list-editor";
import { ItemView, Notice, setIcon } from "obsidian";
import { DescribableEditorUIMaker } from "./describable";
import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { Life } from "plugin-specific/models/life";
import { BaseCategories } from "plugin-specific/models/const";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { RelatedObservationGridEditor } from "../list-editors/related-observation";

export class ConceptEditorUIMaker extends DescribableEditorUIMaker {
    MakeUI(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.empty();
        div.className = 'vbox gl-scroll gl-outer-div gl-fill';
        this.MakeNameEditor(view, div.createDiv(), concept);
        this.MakeAliasesEditor(view, div.createDiv(), concept);
        this.MakeCategoryEditor(view, div.createDiv(), concept);
        this.MakeMediaListEditor(view, div.createDiv(), concept);
        this.MakeDescriptionEditor(view, div.createDiv(), concept);
        this.MakeObservationListDisplay(view, div.createDiv(), concept);
    }

    protected MakeNameEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.empty();
        div.addClass('vbox'); 

        HTMLHelper.CreateNewTextDiv(div, 'Name');

        const nameInput = div.createEl('input', {
            type: 'text',
            value: concept.name
        });
        nameInput.className = 'gl-fill';

        view.registerDomEvent(nameInput, 'change', async () => {
            const newValue = nameInput.value;
                if (newValue !== concept.name) {
                    concept.name = newValue;
                    await view.onSave();
                }
            }
        )
    }

    protected MakeAliasesEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.className = 'hbox';
        HTMLHelper.CreateNewTextDiv(div, 'Aliases:');
        const listEditor = new AliasListEditor(div.createDiv(), concept.aliases, view.onSave);
        listEditor.Render(view);
    }

    protected MakeCategoryEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.className = 'hbox';
        HTMLHelper.CreateNewTextDiv(div, 'Categories:');
        const context = { life: view.life, concept: concept };
        const listEditor = new CategoryListEditor(context, div.createDiv(), concept.categoryKeys, view.onSave);
        listEditor.Render(view);
    }

    protected MakeObservationListDisplay(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.className = 'vbox';
        HTMLHelper.CreateNewTextDiv(div, 'Observations:');
        const listEditor = new RelatedObservationGridEditor(div.createDiv(), view.life, concept, view.onSave);
        listEditor.Render(view);
    }
}

//#region Alias
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

export class AliasListEditor extends ListEditor<string> {
    constructor(parentDiv: HTMLDivElement, aliases: string[], onSave: () => Promise<void>) {
        const uiMaker = new AliasUIMaker();
        super(undefined, parentDiv, aliases, () => { return '' }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}
//#endregion Alias

//#region Category
class CategoryContext {
    constructor(public life: Life, public concept: Concept) {}
}
export class CategoryUIMaker extends ObjUIMaker<string> {
    get context(): CategoryContext {
        return <CategoryContext> this.globalData;
    }
    set context(newContext: CategoryContext) {
        this.globalData = newContext;
    }
    get life(): Life {
        return <Life> this.globalData.life;
    }
    set life(newLife: Life) {
        this.globalData.life = newLife;
    }

    constructor(context: CategoryContext) {
        super();
        this.context = context;
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

        for (let i = 0; i < this.life.categories.length; i++) {
            const category = this.life.categories[i];
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
                view.OpenCorrectConceptEditor(this.context.concept);
            }
            mainArray[index] = categoryInput.value;
            await onSave();
        });
    }
}

export class CategoryListEditor extends ListEditor<string> {
    constructor(context: CategoryContext, parentDiv: HTMLDivElement, categories: string[], onSave: () => Promise<void>) {
        const uiMaker = new CategoryUIMaker(context);
        super(context, parentDiv, categories, () => { return '' }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
    protected override CreateAddButton(view: ItemView): void {
        const mainArray = this.mainArray;
        const addButton = this.parentDiv.createEl('button');
        setIcon(addButton, 'plus');

        view.registerDomEvent(addButton, 'click', async () => {
            if (mainArray.contains('')) {
                new Notice('Choose a category before adding new ones!');
                return;
            }
            const newItem = await this.newObjMaker();
            this.mainArray.push(newItem);
            await this.onSave();
            await this.RefreshList(view);
        });
    }
}
//#endregion Category