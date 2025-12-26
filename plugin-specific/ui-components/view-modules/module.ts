import { HTMLHelper } from "ui-patterns/html-helper";
import { ListEditor } from "ui-patterns/list-editor";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { ItemView, Notice, setIcon } from "obsidian";
import { KeyValue } from "plugin-specific/models/key-value";
import { Life } from "plugin-specific/models/life";
import { GridEditor } from "ui-patterns/grid-editor";
import { KeyService } from "plugin-specific/services/key";

export abstract class KeyValueUIMaker<T> extends ObjUIMaker<KeyValue<T>> {
    get life(): Life {
        return <Life> this.globalData;
    }
    set life(newLife: Life) {
        this.globalData = newLife;
    }

    constructor(life: Life) {
        super();
        this.life = life;
    }

    protected abstract ChangeKey(
        index: number,
        newKey: string
    ): void | Promise<void>;

    protected async MakeKeyUI(
        view: ItemView,
        keyDiv: HTMLDivElement,
        mainArray: KeyValue<T>[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ) {
        HTMLHelper.CreateNewTextDiv(keyDiv, 'Key');
        const keyInput = keyDiv.createEl('input', { type: 'text', value: mainArray[index].key } );
        view.registerDomEvent(keyInput, 'change', async () => {
            try {
                KeyService.CheckIfDuplicateKey(mainArray, keyInput.value);
                await this.ChangeKey(index, keyInput.value);
                mainArray[index].key = keyInput.value;
                await onSave();
            } catch {
                keyInput.value = mainArray[index].key;
            }
        });
    }

    protected ChangeValue(
        mainArray: KeyValue<T>[],
        index: number,
        newValue: T
    ) {
        const existingKeyIndex = KeyService.FindValue(mainArray, newValue, );
        if (existingKeyIndex !== -1) {
            new Notice('This value is already registered as key #' + existingKeyIndex + ' !');
            throw new Error('This value is already registered as key #' + existingKeyIndex + ' !');
        }
        mainArray[index].value = newValue;
    }
    
    protected abstract MakeValueUI(
        view: ItemView,
        valueDiv: HTMLDivElement,
        mainArray: KeyValue<T>[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void>;

    protected abstract DeleteKey(
        index: number,
    ): void | Promise<void>;

    override async MakeDeleteButton(
        view: ItemView,
        div: HTMLDivElement,
        mainArray: KeyValue<T>[],
        index: number,
        onRefresh: () => Promise<void>
    ) {
		const deleteButton = div.createEl('button');
        deleteButton.className = 'gl-fit-content remove-button';
        setIcon(deleteButton, 'trash-2');
		view.registerDomEvent(deleteButton, 'click', async () => {
            await this.DeleteKey(index);
            await onRefresh();
		});
    }

    override async MakeUI(
        view: ItemView,
        itemDiv: HTMLDivElement,
        mainArray: KeyValue<T>[],
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
        
        const contentDiv = itemDiv.createDiv('gl-outer-div ' + (this.isVertical ? 'vbox' : 'hbox'));
        this.MakeKeyUI(view, contentDiv.createDiv('gl-outer-div'), mainArray, index, onSave, onRefresh);
        this.MakeValueUI(view, contentDiv.createDiv('gl-outer-div'), mainArray, index, onSave, onRefresh);
        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);
    }
}

export class KeyValueListEditor<T> extends ListEditor<KeyValue<T>> {
    get life(): Life {
        return <Life> this.globalData;
    }
    set life(newLife: Life) {
        this.globalData = newLife;
    }
    defaultValue: any;
    compareFunction: (a: any, b: any) => boolean = (a, b) => {
        return a === b;
    }
    protected override CreateAddButton(view: ItemView): void {
        const mainArray = this.mainArray;
        const addButton = this.parentDiv.createEl('button');
        setIcon(addButton, 'plus');

        view.registerDomEvent(addButton, 'click', async () => {
            if (KeyService.HasKey(mainArray, '') || KeyService.HasValue(mainArray, this.defaultValue, this.compareFunction)) {
                new Notice('Name the empty entry first!');
                return;
            }
            const newItem = await this.newObjMaker();
            mainArray.push(newItem);
            await this.onSave();
            await this.RefreshList(view);
        });
    }
}

export class KeyValueGridEditor<T> extends GridEditor<KeyValue<T>> {
    get life(): Life {
        return <Life> this.globalData;
    }
    set life(newLife: Life) {
        this.globalData = newLife;
    }
    defaultValue: any;
    compareFunction: (a: any, b: any) => boolean = (a, b) => {
        return a === b;
    }
    protected override CreateAddButton(view: ItemView): void {
        const mainArray = this.mainArray;
        const anchor = this.parentDiv.createDiv('gl-pos-anchor');
        const addButton = anchor.createEl('button');
        setIcon(addButton, 'plus');
        addButton.id = 'gl-grid-add-button';

        view.registerDomEvent(addButton, 'click', async () => {
            if (KeyService.HasKey(mainArray, '') || KeyService.HasValue(mainArray, this.defaultValue, this.compareFunction)) {
                new Notice('Name the empty entry first!');
                return;
            }
            const newItem = await this.newObjMaker();
            mainArray.push(newItem);
            await this.onSave();
            await this.RefreshList(view);
        });
    }
}