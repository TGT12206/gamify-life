import {App, FuzzySuggestModal, Notice, TFile} from 'obsidian';

export class SkillPathModal extends FuzzySuggestModal<TFile> {

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
            if (currFile.extension !== 'skill') {
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