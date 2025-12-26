import { ListEditor } from "ui-patterns/list-editor";
import { ItemView, setIcon } from "obsidian";
import { ObjUIMaker } from "./obj-ui-maker";

export class GridEditor<T> extends ListEditor<T> {
    public itemsPerLine: number;

    constructor(
        globalData: any,
        parentDiv: HTMLDivElement,
        mainArray: T[],
        newObjMaker: () => (T | Promise<T>),
        objUIMaker: ObjUIMaker<T>,
        onSave: () => Promise<void>,
        itemsPerLine: number = 5
    ) {
        super(globalData, parentDiv, mainArray, newObjMaker, objUIMaker, onSave);
        this.itemsPerLine = itemsPerLine;
    }

    public async Render(view: ItemView) {
        const classNames = (this.isVertical ? 'vbox' : 'hbox') + ' gl-fill gl-outer-div ' + this.extraClasses;

        this.parentDiv.empty();
        this.parentDiv.className = classNames;
        this.listDiv = this.parentDiv.createDiv(classNames + ' grid');

        if (this.enableAddButton) {
            this.CreateAddButton(view);
        }
        await this.RefreshList(view);
    }

    public override async RefreshList(view: ItemView) {
        const scrollTop = this.listDiv.scrollTop;
        this.listDiv.empty();
        if (this.isVertical) {
            this.listDiv.style.gridTemplateColumns = 'repeat(' + this.itemsPerLine + ', 1fr)';
        } else {
            this.listDiv.style.gridTemplateRows = 'repeat(' + this.itemsPerLine + ', 1fr)';
        }
        
        for (let i = 0; i < this.mainArray.length; i++) {
            const itemContainer = this.listDiv.createDiv('gl-outer-div gl-scroll ' + (this.objUIMaker.isVertical ? 'vbox' : 'hbox'));
            await this.objUIMaker.MakeUI(
                view,
                itemContainer,
                this.mainArray,
                i,
                this.onSave,
                async () => {
                    await this.onSave();
                    await this.RefreshList(view);
                }
            );
        }
        this.listDiv.scrollTop = scrollTop;
    }

    protected override CreateAddButton(view: ItemView) {
        const anchor = this.parentDiv.createDiv('gl-pos-anchor');
        const addButton = anchor.createEl('button');
        setIcon(addButton, 'plus');
        addButton.id = 'gl-grid-add-button';

        view.registerDomEvent(addButton, 'click', async () => {
            const newItem = await this.newObjMaker();
            this.mainArray.push(newItem);
            await this.onSave();
            await this.RefreshList(view);
        });
    }
}