import { Moment } from 'base-classes/moment';
import { HTMLHelper } from 'html-helper';
import { setIcon, TextFileView, TFile, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_SKILL = 'skill';
export const SKILL_EXTENSION = 'skill';

export class MomentView extends TextFileView {
    moment: Moment;
    mainDiv: HTMLDivElement;
    currentFileName: string;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_SKILL;
    }

    override async onLoadFile(file: TFile): Promise<void> {
        this.currentFileName = file.basename;
        super.onLoadFile(file);
    }

    override async onRename(file: TFile): Promise<void> {
        this.currentFileName = file.basename;
        this.requestSave();
    }

    getDisplayText() {
        return this.currentFileName;
    }

    override async setViewData(data: string, clear: boolean): Promise<void> {
        this.Display(data);
    }

    getViewData(): string {
        return JSON.stringify(this.moment);
    }

    clear(): void {
        this.currentFileName = '';
        return;
    }

    private Display(data: string) {
        this.ParseAndReassignData(data);
        this.contentEl.empty();
        this.mainDiv = this.contentEl.createDiv();
        this.SetUserDefinedCSSProperties();
    }

    //#region Display Helper Functions
    private ParseAndReassignData(data: string) {
        const plainObj = JSON.parse(data);
        this.moment = new Moment();
        Object.assign(this.moment, plainObj);
    }

    private SetUserDefinedCSSProperties() {
        // this is for showing the colors of this skill via css as defined by the user.
    }
    //#endregion Display Helper Functions
}
