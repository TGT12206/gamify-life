import { ItemView, Notice, setIcon } from "obsidian";
import { Concept } from "plugin-specific/models/concept";
import { ListEditor } from "ui-patterns/list-editor";
import { CategoryUIMaker } from "../ui-makers/category";

export class CategoryListEditor extends ListEditor<string> {
    constructor(concept: Concept, parentDiv: HTMLDivElement, categories: string[], onSave: () => Promise<void>) {
        const uiMaker = new CategoryUIMaker(concept);
        super(concept, parentDiv, categories, () => { return '' }, uiMaker, onSave);
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