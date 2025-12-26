import { HTMLHelper } from "ui-patterns/html-helper";
import { ItemView } from "obsidian";
import { GamifyLifeView } from "../gamify-life-view";
import { Life } from "plugin-specific/models/life";
import { KeyValueListEditor, KeyValueUIMaker } from "./module";
import { KeyValue } from "plugin-specific/models/key-value";
import { BaseCategories } from "plugin-specific/models/const";
import { CategoryService } from "plugin-specific/services/category";

export function DisplayCategoryModule(view: GamifyLifeView, life: Life, div: HTMLDivElement) {
    div.className = 'gl-scroll gl-fill gl-outer-div vbox';
    HTMLHelper.CreateNewTextDiv(div, 'Concept categories');
    const listEditor = new CategoryKVListEditor(
        life, div.createDiv(), life.categories, view.onSave
    );
    listEditor.Render(view);
}
class CategoryKVUIMaker extends KeyValueUIMaker<string> {
    protected override DeleteKey(index: number): void | Promise<void> {
        CategoryService.DeleteCategoryKey(this.life, index);
    }
    protected override ChangeKey(index: number, newKey: string): void | Promise<void> {
        CategoryService.ChangeCategoryKey(this.life, index, newKey);
    }
    protected override async MakeKeyUI(view: ItemView, keyDiv: HTMLDivElement, mainArray: KeyValue<string>[], index: number, onSave: () => Promise<void>, onRefresh: () => Promise<void>): Promise<void> {
        keyDiv.classList.add('hbox');
        if (BaseCategories.contains(mainArray[index].key)) {
            HTMLHelper.CreateNewTextDiv(keyDiv, 'ID ' + mainArray[index].key);
            HTMLHelper.CreateNewTextDiv(keyDiv, ' ');
        } else {
            HTMLHelper.CreateNewTextDiv(keyDiv, 'ID');
            const keyInput = keyDiv.createEl('input', { type: 'text', value: mainArray[index].key } );
            
            view.registerDomEvent(keyInput, 'change', async () => {
                try {
                    this.ChangeKey(index, keyInput.value);
                    mainArray[index].key = keyInput.value;
                    await onSave();
                } catch {
                    keyInput.value = mainArray[index].key;
                }
            });
        }
    }
    protected override async MakeValueUI(view: ItemView, valueDiv: HTMLDivElement, mainArray: KeyValue<string>[], index: number, onSave: () => Promise<void>, onRefresh: () => Promise<void>): Promise<void> {
        valueDiv.classList.add('hbox');
        HTMLHelper.CreateNewTextDiv(valueDiv, 'Name');
        const nameInput = valueDiv.createEl('input', { type: 'text', value: mainArray[index].value } );
        
        view.registerDomEvent(nameInput, 'change', async () => {
            try {
                this.ChangeValue(mainArray, index, nameInput.value);
                mainArray[index].key = nameInput.value;
                await onSave();
            } catch {
                nameInput.value = mainArray[index].value;
            }
        });
    }
    override async MakeUI(
        view: ItemView,
        itemDiv: HTMLDivElement,
        mainArray: KeyValue<string>[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ) {
        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        HTMLHelper.CreateNewTextDiv(itemDiv, index + ':');
        const shiftButtonsDiv = itemDiv.createDiv(this.isVertical ? 'hbox' : 'vbox');

        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'left' : 'up', onRefresh);
        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'right' : 'down', onRefresh);
        
        const contentDiv = itemDiv.createDiv('hbox gl-outer-div');
        this.MakeKeyUI(view, contentDiv.createDiv('gl-outer-div'), mainArray, index, onSave, onRefresh);
        this.MakeValueUI(view, contentDiv.createDiv('gl-outer-div'), mainArray, index, onSave, onRefresh);
        if (!BaseCategories.contains(mainArray[index].key)) {
            this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);
        }
    }
}

class CategoryKVListEditor extends KeyValueListEditor<string> {
    constructor(
        life: Life,
        parentDiv: HTMLDivElement,
        mainArray: KeyValue<string>[],
        onSave: () => Promise<void>
    ) {
        const uiMaker = new CategoryKVUIMaker(life);
        super(life, parentDiv, mainArray, () => { return new KeyValue<string>('', '') } , uiMaker, onSave);
        this.defaultValue = '';
        this.isVertical = true;
        uiMaker.isVertical = false;
    }
}