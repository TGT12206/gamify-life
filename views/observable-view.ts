import { HTMLHelper } from 'html-helper';
import { TextFileView, TFile, WorkspaceLeaf } from 'obsidian';
import { Observable } from 'base-classes/observable';

export const VIEW_TYPE_OBSERVABLE = 'observable';
export const OBSERVABLE_EXTENSION = 'observable';

export class ObservableView extends TextFileView {
    observable: Observable;
    mainDiv: HTMLDivElement;
    namesDiv: HTMLDivElement;
    mediaDiv: HTMLDivElement;
    descriptionDiv: HTMLDivElement;

    protected get vault() {
        return this.app.vault;
    }

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_OBSERVABLE;
    }

    override async setViewData(data: string, clear: boolean): Promise<void> {
        this.Display(data);
    }

    getViewData(): string {
        return JSON.stringify(this.observable);
    }

    clear(): void {
        return;
    }

    Display(data: string) {
        this.ParseAndReassignData(data);
        this.contentEl.empty();
        this.mainDiv = this.contentEl.createDiv('gl-main gl-outer-container vbox');

        const mainDiv = this.mainDiv;

        this.namesDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');
        this.mediaDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');
        this.descriptionDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');

        this.DisplayAliases();
        HTMLHelper.DisplayMediaFiles(this.mediaDiv, this, this.observable.mediaPaths);
        this.DisplayDescription();
    }

    protected ParseAndReassignData(data: string) {
        const plainObj = JSON.parse(data);
        this.observable = new Observable();
        Object.assign(this.observable, plainObj);
    }

    /**
     * Creates an list editor to edit the aliases of the observable.
     */
    protected async DisplayAliases() {
        const div = this.namesDiv;
        div.empty();

        HTMLHelper.CreateNewTextDiv(div, 'Aliases');

        HTMLHelper.CreateListEditor(
            div.createDiv(), 'gl-outer-container', false,
            this, this.observable.aliases, () => { return ''; },
            (div: HTMLDivElement, index: number, refreshList: () => Promise<void>) => {
                this.DisplayAlias(div, index, refreshList);
            }
        );
    }
    
    protected async DisplayAlias(
        div: HTMLDivElement,
        index: number,
        refreshList: () => Promise<void>
    ) {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-container');
        div.empty();
        
        const shiftButtonsDiv = div.createDiv('hbox');

        HTMLHelper.CreateShiftElementUpButton(
            shiftButtonsDiv, this, this.observable.aliases, index, false,
            async () => {
                await refreshList();
                this.requestSave();
            }
        );
        HTMLHelper.CreateShiftElementDownButton(
            shiftButtonsDiv, this, this.observable.aliases, index, false,
            async () => {
                await refreshList();
                this.requestSave();
            }
        );

        const input = div.createEl('input', { type: 'text', value: this.observable.aliases[index] } );

        HTMLHelper.CreateDeleteButton(
            div, this, this.observable.aliases, index,
            async () => {
                await refreshList();
                this.requestSave();
            }
        );

        this.registerDomEvent(input, 'change', () => {
            this.observable.aliases[index] = input.value;
            this.requestSave();
        });
    }

    /**
     * Creates a textarea for the user to edit the description
     * of this observable.
     */
    protected DisplayDescription() {
        const div = this.descriptionDiv;
        div.empty();
        HTMLHelper.CreateNewTextDiv(div, 'Description');
        const input = div.createEl('textarea', { text: this.observable.description } );
        this.registerDomEvent(input, 'change', () => {
            this.observable.description = input.value;
            this.requestSave();
        });
    }
}
