import { MediaPathModal } from "modals/media-path-modal";
import { ItemView, Notice, setIcon, TextFileView, TFile, View } from "obsidian";

export class HTMLHelper {
    static AutoAdjustWidth(cleanDiv: HTMLDivElement, el: HTMLElement, text: string) {
        const tempEl = cleanDiv.createEl('div', { text: text } );
        tempEl.style.position = 'absolute';
        tempEl.style.whiteSpace = 'pre-wrap';
        tempEl.style.visibility = 'hidden';
        tempEl.style.font = el.style.font;
        tempEl.style.fontSize = el.style.fontSize;
        tempEl.style.writingMode = el.style.writingMode;
        tempEl.style.textOrientation = el.style.textOrientation;
        tempEl.style.padding = '1vh';
        const temp = tempEl.getBoundingClientRect();

        el.style.width = temp.width + 'px';

        tempEl.remove();
    }
    static AutoAdjustHeight(cleanDiv: HTMLDivElement, el: HTMLElement, text: string) {
        const tempEl = cleanDiv.createEl('div', { text: text } );
        tempEl.style.position = 'absolute';
        tempEl.style.whiteSpace = 'pre-wrap';
        tempEl.style.visibility = 'hidden';
        tempEl.style.font = el.style.font;
        tempEl.style.fontSize = el.style.fontSize;
        tempEl.style.writingMode = el.style.writingMode;
        tempEl.style.textOrientation = el.style.textOrientation;
        tempEl.style.padding = '0px';
        const temp = tempEl.getBoundingClientRect();

        el.style.height = (temp.height > 25 ? temp.height : 25) + 'px';

        tempEl.remove();
    }
    static AddTextToDiv(div: HTMLDivElement, text: string) {
        div.textContent = text;
    }
    static CreateNewTextDiv(parentDiv: HTMLDivElement, text: string, classes: string = ''): HTMLDivElement {
        const newDiv = parentDiv.createEl('div', { text: text } );
        newDiv.className = classes;
        return newDiv;
    }
    static async CreateList(
        div: HTMLDivElement,
        extraDivClasses: string,
        listIsVertical: boolean,
        mainArray: any[],
        objUIMaker: (
            div: HTMLDivElement,
            index: number
        ) => (void | Promise<void>)
    ) {
        div.empty();
        div.className = (listIsVertical ? 'vbox' : 'hbox') + ' gl-scroll ' + extraDivClasses;
        for (let i = 0; i < mainArray.length; i++) {
            objUIMaker(div.createDiv(!listIsVertical ? 'vbox' : 'hbox'), i);
        }
    }
    static async CreateListEditor(
        div: HTMLDivElement,
        extraDivClasses: string,
        listIsVertical: boolean,
        view: ItemView,
        mainArray: any[],
        newObjMaker: () => (any | Promise<any>),
        objUIMaker: (
            div: HTMLDivElement,
            index: number,
            refreshList: () => Promise<void>,
            refreshPage: () => Promise<void>
        ) => (void | Promise<void>),
        refreshPage: () => Promise<void>
    ) {
        div.empty();
        div.className = (listIsVertical ? 'vbox' : 'hbox') + ' ' + extraDivClasses;
        const listDiv = div.createDiv((listIsVertical ? 'vbox' : 'hbox') + ' gl-scroll ' + extraDivClasses);

        const refreshList = async () => {
            this.CreateListEditor(
                div, extraDivClasses, listIsVertical,
                view,
                mainArray, newObjMaker, objUIMaker,
                refreshPage
            );
        }
        
        for (let i = 0; i < mainArray.length; i++) {
            objUIMaker(listDiv.createDiv(!listIsVertical ? 'vbox' : 'hbox'), i, refreshList, refreshPage);
        }
        const addButton = div.createEl('button');
        setIcon(addButton, 'plus');
        view.registerDomEvent(addButton, 'click', async () => {
            const index = mainArray.length;
            mainArray.push( await newObjMaker() );
            await objUIMaker(listDiv.createDiv(!listIsVertical ? 'vbox' : 'hbox'), index, refreshList, refreshPage);
        });
    }
    static CreateColorSwapButton(
        parentDiv: HTMLDivElement,
        view: ItemView,
        color1: { name: string, el: HTMLInputElement },
        color2: { name: string, el: HTMLInputElement },
        isVertical: boolean = false,
        afterSwap: () => Promise<void>
    ) {
		const div = parentDiv.createDiv(isVertical ? 'vbox' : 'hbox');
        
        const obj1Name = this.CreateNewTextDiv(div, color1.name);
        const swapButton = div.createEl('button')
        const obj2Name = this.CreateNewTextDiv(div, color2.name);

		setIcon(swapButton, isVertical ? 'arrow-down-up' : 'arrow-left-right');

        obj1Name.style.writingMode = isVertical ? 'vertical-lr' : 'unset';
        obj2Name.style.writingMode = isVertical ? 'vertical-lr' : 'unset';

        obj1Name.style.textOrientation = isVertical ? 'upright' : 'unset';
        obj2Name.style.textOrientation = isVertical ? 'upright' : 'unset';

		view.registerDomEvent(swapButton, 'click', () => {
            const temp = color1.el.value;
            color1.el.value = color2.el.value;
            color2.el.value = temp;
            afterSwap();
		});
    }
    static CreateShiftElementUpButton(
        div: HTMLDivElement,
        view: ItemView,
        mainArray: any[],
        index: number,
        listIsVertical: boolean,
        refreshList: () => Promise<void>
    ) {
		const upButton = div.createEl('button');
		setIcon(upButton, listIsVertical ? 'arrow-big-up' : 'arrow-big-left');
		view.registerDomEvent(upButton, 'click', () => {
			if (index > 0) {
				const temp = mainArray.splice(index, 1);
				mainArray.splice(index - 1, 0, temp[0]);
				refreshList();
			}
		});
    }
    static CreateShiftElementDownButton(
        div: HTMLDivElement,
        view: ItemView,
        mainArray: any[],
        index: number,
        listIsVertical: boolean,
        refreshList: () => Promise<void>
    ) {
		const downButton = div.createEl('button');
		setIcon(downButton, listIsVertical ? 'arrow-big-down' : 'arrow-big-right');
		view.registerDomEvent(downButton, 'click', () => {
			if (index < mainArray.length) {
				const temp = mainArray.splice(index, 1);
				mainArray.splice(index + 1, 0, temp[0]);
				refreshList();
			}
		});
    }
    static CreateDeleteButton(
        div: HTMLDivElement,
        view: ItemView,
        mainArray: any[],
        index: number,
        refreshList: () => Promise<void>
    ) {
		const deleteButton = div.createEl('button');
        deleteButton.className = 'remove-button';
        setIcon(deleteButton, 'trash-2');
		view.registerDomEvent(deleteButton, 'click', () => {
			mainArray.splice(index, 1);
			refreshList();
		});
    }
    static CreateExitButton(
        div: HTMLDivElement,
        view: ItemView,
        beforeExit: () => Promise<void> = async () => {},
        afterExit: () => Promise<void> = async () => {}
    ) {
		const exitButton = div.createEl('button');
        exitButton.className = 'exit-button';
        setIcon(exitButton, 'x');
		view.registerDomEvent(exitButton, 'click', async () => {
            await beforeExit();
            div.remove();
            afterExit();
		});
    }

    static DateToDateTimeLocalString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');

        return year + '-' + month + '-' + day + 'T' + hour + ':' + minute;
    }

    /**
     * Creates a list editor for all the media files the user adds to
     * the list of media files.
     */
    static DisplayMediaFiles(div: HTMLDivElement, view: ItemView, mediaPaths: string[]) {
        div.empty();
        HTMLHelper.CreateListEditor(
            div.createDiv(), 'gl-outer-container', false, view, mediaPaths,
            () => { return ''; },
            (
                div: HTMLDivElement, index: number,
                refreshList: () => Promise<void>
            ) => {
                this.DisplayMedia(div, index, refreshList, view, mediaPaths);
            },
            async () => {
                this.DisplayMediaFiles(div, view, mediaPaths);
            }
        );
    }

    /**
     * Creates an editor for a displayed media file, allowing the user
     * to view, change, and delete the path and order of media files.
     */
    private static DisplayMedia(
        div: HTMLDivElement,
        index: number,
        refreshList: () => Promise<void>,
        view: ItemView,
        mediaPaths: string[]
    ) {
        const shiftButtonsDiv = div.createDiv('hbox');

        HTMLHelper.CreateShiftElementUpButton(shiftButtonsDiv, view, mediaPaths, index, false, refreshList);
        HTMLHelper.CreateShiftElementDownButton(shiftButtonsDiv, view, mediaPaths, index, false, refreshList);

        const pathDiv = div.createDiv('hbox');
        HTMLHelper.CreateNewTextDiv(pathDiv, mediaPaths[index], 'gl-scroll');
        const openFileButton = pathDiv.createEl('button', { text: 'Open Link' } );
        const openModalButton = pathDiv.createEl('button', { text: 'Edit Link' } );
        const mediaDiv = div.createDiv('vbox');
        HTMLHelper.CreateDeleteButton(div, view, mediaPaths, index, refreshList);

        const changePath = async (file: TFile) => {
            mediaPaths[index] = file.path;
            if (view instanceof TextFileView) {
                view.requestSave();
            }
        }

        const pathModal = new MediaPathModal(view.app, mediaDiv, async (file: TFile) => { await changePath(file); });

        pathModal.fetchMediaFileFromPath(mediaPaths[index]);

        view.registerDomEvent(openFileButton, 'click', () => {
            const tFile = view.app.vault.getFileByPath(mediaPaths[index]);
            if (tFile === null) {
                return new Notice(mediaPaths[index] + ' not found');
            }
            view.app.workspace.getLeaf('tab').openFile(tFile);
        });

        view.registerDomEvent(openModalButton, 'click', () => {
            pathModal.open();
        });

    }
}