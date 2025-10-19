import { HTMLHelper } from 'html-helper';
import { App, FuzzySuggestModal, TextFileView, TFile, WorkspaceLeaf } from 'obsidian';
import { Observable } from 'base-classes/observable';
import { Observation } from 'base-classes/observation';
import { ObservablePathModal } from 'modals/observable-path-modal';
import { OBSERVABLE_EXTENSION } from './observable-view';
import { MOMENT_EXTENSION } from './moment-view';

export const VIEW_TYPE_OBSERVATION = 'observation';
export const OBSERVATION_EXTENSION = 'observation';

export class ObservationView extends TextFileView {
    observation: Observation;
    mainDiv: HTMLDivElement;
    observableDiv: HTMLDivElement;
    mediaDiv: HTMLDivElement;
    descriptionDiv: HTMLDivElement;
    evidenceDiv: HTMLDivElement;

    protected get vault() {
        return this.app.vault;
    }

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_OBSERVATION;
    }

    override async setViewData(data: string, clear: boolean): Promise<void> {
        this.Display(data);
    }

    getViewData(): string {
        return JSON.stringify(this.observation);
    }

    clear(): void {
        return;
    }

    Display(data: string) {
        this.ParseAndReassignData(data);
        this.contentEl.empty();
        this.mainDiv = this.contentEl.createDiv('gl-main gl-outer-container vbox');

        const mainDiv = this.mainDiv;

        this.observableDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');
        
        this.mediaDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');
        this.descriptionDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');
        
        this.evidenceDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');

        this.DisplayObservables();
        HTMLHelper.DisplayMediaFiles(this.mediaDiv, this, this.observation.mediaPaths);
        this.DisplayDescription();
        this.DisplayEvidenceList();
    }

    protected ParseAndReassignData(data: string) {
        const plainObj = JSON.parse(data);
        this.observation = new Observation();
        Object.assign(this.observation, plainObj);
    }

    /**
     * Creates a list editor for all the observables involved in
     * this moment.
     */
    private DisplayObservables() {
        const div = this.observableDiv;
        div.empty();
        HTMLHelper.CreateNewTextDiv(div, 'Observables Involved');
        HTMLHelper.CreateListEditor(
            div.createDiv(), 'gl-outer-container', false,
            this, this.observation.objectObservedPaths,
            () => { return new Observable(); },
            async (
                div: HTMLDivElement,
                index: number,
                refreshList: () => Promise<void>
            ) => {
                await this.DisplayObservable(div, index, refreshList);
            }
        );
    }
    
    /**
     * Creates an editor for the path to the observable.
     */
    private async DisplayObservable(
        div: HTMLDivElement,
        index: number,
        refreshList: () => Promise<void>
    ) {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-container');

        const shiftButtonsDiv = div.createDiv('hbox');

        const list = this.observation.objectObservedPaths;
        let observablePath = list[index];
        if (list[index] === '') {
            list[index] = 'Unnamed Observable.observable';
            observablePath = 'Unnamed Observable.observable';
        }
        const tFile = this.vault.getFileByPath(observablePath);

        HTMLHelper.CreateShiftElementUpButton(shiftButtonsDiv, this, list, index, false, refreshList);
        HTMLHelper.CreateShiftElementDownButton(shiftButtonsDiv, this, list, index, false, refreshList);
        
        const buttonsDiv = div.createDiv('hbox');
        const open = buttonsDiv.createEl('button', { text: 'Open Link' } );
        const edit = buttonsDiv.createEl('button', { text: 'Edit Link' } );

        const skillNameDiv = HTMLHelper.CreateNewTextDiv(div, tFile ? tFile.basename : 'Unnamed Observable');

        HTMLHelper.CreateDeleteButton(div, this, list, index, refreshList);

        const updateObservable = async (file: TFile) => {
            pathModal.close();
            observablePath = file.path;
            list[index] = file.path;
            skillNameDiv.textContent = file.basename;
            this.requestSave();
        }

        const pathModal = new ObservablePathModal(this.app, updateObservable);

        this.registerDomEvent(edit, 'click', () => {
            pathModal.open();
        });
        this.registerDomEvent(open, 'click', async () => {
            const tFile = this.vault.getFileByPath(list[index]);
            if (tFile !== null) {
                this.app.workspace.getLeaf('tab').openFile(tFile);
            } else {
                const newObservable = new Observable();
                const newFile = await this.app.vault.create('Unnamed Observable.observable', JSON.stringify(newObservable));
                this.app.workspace.getLeaf('tab').openFile(newFile);
            }
        });
    }

    /**
     * Creates a textarea for the user to edit the description
     * of this observable.
     */
    private DisplayDescription() {
        const div = this.descriptionDiv;
        div.empty();
        HTMLHelper.CreateNewTextDiv(div, 'Description');
        const input = div.createEl('textarea', { text: this.observation.description } );
        this.registerDomEvent(input, 'change', () => {
            this.observation.description = input.value;
            this.requestSave();
        });
    }

    /**
     * Creates a list editor for all the observables involved in
     * this moment.
     */
    private DisplayEvidenceList() {
        const div = this.evidenceDiv;
        div.empty();
        HTMLHelper.CreateNewTextDiv(div, 'Evidence List');
        HTMLHelper.CreateListEditor(
            div.createDiv(), 'gl-outer-container', false,
            this, this.observation.evidenceList,
            () => { return new Observable(); },
            async (
                div: HTMLDivElement,
                index: number,
                refreshList: () => Promise<void>
            ) => {
                await this.DisplayEvidence(div, index, refreshList);
            }
        );
    }
    
    /**
     * Creates an editor for the path to the observable.
     */
    private async DisplayEvidence(
        div: HTMLDivElement,
        index: number,
        refreshList: () => Promise<void>
    ) {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-container');

        const shiftButtonsDiv = div.createDiv('hbox');

        const list = this.observation.evidenceList;

        HTMLHelper.CreateShiftElementUpButton(shiftButtonsDiv, this, list, index, true, refreshList);
        HTMLHelper.CreateShiftElementDownButton(shiftButtonsDiv, this, list, index, true, refreshList);

        let path = list[index].sourcePath;
        if (list[index].sourcePath === '') {
            list[index].sourcePath = 'Unnamed ' + (list[index].type === 'Inference' ? 'Observation.observation' : 'Moment.moment');
            path = list[index].sourcePath;
        }
        const tFile = this.vault.getFileByPath(path);
        
        const buttonsDiv = div.createDiv('hbox');
        const open = buttonsDiv.createEl('button', { text: 'Open Link' } );
        const edit = buttonsDiv.createEl('button', { text: 'Edit Link' } );
        HTMLHelper.CreateNewTextDiv(buttonsDiv, 'Is Inference');
        const isInference = buttonsDiv.createEl('input', { type: 'checkbox' } );
        isInference.checked = list[index].type === 'Inference';

        const skillNameDiv = HTMLHelper.CreateNewTextDiv(div, tFile ? tFile.basename : path);

        HTMLHelper.CreateDeleteButton(div, this, list, index, refreshList);

        const updateSource = async (file: TFile) => {
            pathModal.close();
            path = file.path;
            list[index].sourcePath = file.path;
            skillNameDiv.textContent = file.basename;
            this.requestSave();
        }

        const pathModal = new SourceModal(this.app, () => { return isInference.checked }, updateSource);

        this.registerDomEvent(edit, 'click', () => {
            pathModal.open();
        });
        this.registerDomEvent(open, 'click', async () => {
            const tFile = this.vault.getFileByPath(list[index].sourcePath);
            if (tFile !== null) {
                this.app.workspace.getLeaf('tab').openFile(tFile);
            } else {
                const newObservable = new Observable();
                const newFile = await this.app.vault.create('Unnamed Observable.observable', JSON.stringify(newObservable));
                this.app.workspace.getLeaf('tab').openFile(newFile);
            }
        });
        this.registerDomEvent(isInference, 'click', async () => {
            list[index].type = isInference.checked ? 'Inference' : 'Firsthand account of actions';
            this.requestSave();
        });
    }
}

class SourceModal extends FuzzySuggestModal<TFile> {

    isInference: () => boolean;
    onSubmit: (file: TFile) => Promise<void>;

    constructor(app: App, isInference: () => boolean, onSubmit: (file: TFile) => Promise<void>) {
        super(app);
        this.isInference = isInference;
        this.onSubmit = onSubmit;
    }

    private get vault() {
        return this.app.vault;
    }
    getItems(): TFile[] {
        const allFiles = this.vault.getFiles();
        for (let i = allFiles.length - 1; i >= 0; i--) {
            const currFile = allFiles[i];
            const isObservation = currFile.extension === OBSERVABLE_EXTENSION;
            const isMoment = currFile.extension === MOMENT_EXTENSION;
            if (
                !(isMoment || isObservation) ||
                (this.isInference() && !isObservation)
            ) {
                allFiles.splice(i, 1);
            }
        }
        return allFiles;
    }

    getItemText(file: TFile): string {
        return file.path;
    }

    onChooseItem(file: TFile, evt: MouseEvent | KeyboardEvent) {
        this.onSubmit(file);
    }
}