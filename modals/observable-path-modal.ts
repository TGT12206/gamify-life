import {App, FuzzySuggestModal, TFile} from 'obsidian';
import { OBSERVABLE_EXTENSION } from 'views/observable-view';
import { SELF_EXTENSION } from 'views/self-view';

export class ObservablePathModal extends FuzzySuggestModal<TFile> {

    onSubmit: (file: TFile) => Promise<void>;

    constructor(app: App, onSubmit: (file: TFile) => Promise<void>) {
        super(app);
        this.onSubmit = onSubmit;
    }

    private get vault() {
        return this.app.vault;
    }
    getItems(): TFile[] {
        const allFiles = this.vault.getFiles();
        for (let i = allFiles.length - 1; i >= 0; i--) {
            const currFile = allFiles[i];
            if (!(currFile.extension === OBSERVABLE_EXTENSION || currFile.extension === SELF_EXTENSION)) {
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