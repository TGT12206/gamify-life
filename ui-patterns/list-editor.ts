import { ItemView, setIcon } from 'obsidian';
import { ObjUIMaker } from './obj-ui-maker';

export class ListEditor<T> {
    globalData: any;
    protected parentDiv: HTMLDivElement;
    protected listDiv: HTMLDivElement;
    public mainArray: T[];
    public newObjMaker: () => (T | Promise<T>);
    public objUIMaker: ObjUIMaker<T>;
    public onSave: () => Promise<void>;

    public isVertical: boolean = true;
    public enableAddButton: boolean = true;
    public extraClasses: string = '';

    constructor(
        globalData: any,
        parentDiv: HTMLDivElement,
        mainArray: T[],
        newObjMaker: () => (T | Promise<T>),
        objUIMaker: ObjUIMaker<T>,
        onSave: () => Promise<void>
    ) {
        this.globalData = globalData;
        this.parentDiv = parentDiv;
        this.mainArray = mainArray;
        this.newObjMaker = newObjMaker;
        this.objUIMaker = objUIMaker;
        this.objUIMaker.globalData = globalData;
        this.onSave = onSave;
    }

    public async Render(view: ItemView) {
        const classNames = (this.isVertical ? 'vbox' : 'hbox') + ' gl-outer-div ' + this.extraClasses;

        this.parentDiv.empty();
        this.parentDiv.className = classNames;
        this.listDiv = this.parentDiv.createDiv(classNames);

        if (this.enableAddButton) {
            this.CreateAddButton(view);
        }
        await this.RefreshList(view);
    }

    public async RefreshList(view: ItemView) {
        const scrollTop = this.listDiv.scrollTop;
        this.listDiv.empty();
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

    protected CreateAddButton(view: ItemView) {
        const addButton = this.parentDiv.createEl('button');
        setIcon(addButton, 'plus');

        view.registerDomEvent(addButton, 'click', async () => {
            const newItem = await this.newObjMaker();
            this.mainArray.push(newItem);
            await this.onSave();
            await this.RefreshList(view);
        });
    }
}