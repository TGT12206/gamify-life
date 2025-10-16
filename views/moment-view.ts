import { Moment } from 'base-classes/moment';
import { HTMLHelper } from 'html-helper';
import { setIcon, TextFileView, TFile, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_MOMENT = 'MOMENT';
export const MOMENT_EXTENSION = 'MOMENT';

export class MomentView extends TextFileView {
    moment: Moment;
    mainDiv: HTMLDivElement;
    currentFileName: string;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_MOMENT;
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

		const mainDiv = this.mainDiv;

		const dateDiv = mainDiv.createDiv('vbox');

		const descriptionDiv = mainDiv.createDiv('vbox');
		const mediaDiv = descriptionDiv.createDiv('hbox');
		const textDescriptionDiv = descriptionDiv.createDiv('hbox');

		const skillDiv = mainDiv.createDiv('hbox');

		this.DisplayDateInfo(dateDiv);
		this.DisplayMediaFiles(mediaDiv);
		this.DisplayDescription(textDescriptionDiv);
		this.DisplaySkillUnitsGained(skillDiv);
    }

    private ParseAndReassignData(data: string) {
        const plainObj = JSON.parse(data);
        this.moment = new Moment();
        Object.assign(this.moment, plainObj);
    }

    /**
	 * Create an editor allowing the user to set the start date/time,
     * the end date/time, and lock either the start or end and change
     * the duration, which changes the unlocked date/time accordingly.
     * 
     * The end date defaults to the current time, and the start date
     * defaults to an hour before the current time.
	 * @param div the div to display inside of.
	 */
    private DisplayDateInfo(div: HTMLDivElement) {

    }


    /**
	 * Creates a list editor for all the media files the user adds to
	 * this moment.
	 * @param div the div to display inside of.
	 */
	private DisplayMediaFiles(div: HTMLDivElement) {

	}

	/**
	 * Creates an editor for a displayed media file, allowing the user
	 * to view, change, and delete the path and order of media files.
	 * @param div the div to display inside of.
	 * @param index the index of the media file.
	 * @param refreshList a function that refreshes the list.
	 * @param refreshPage a function that refreshes the entire page.
	 */
	private DisplayMedia(
		div: HTMLDivElement,
		index: number,
		refreshList: () => Promise<void>,
		refreshPage: () => Promise<void>
	) {

	}

    /**
	 * Creates a textarea for the user to edit the description
	 * of this moment.
	 * @param div the div to display inside of.
	 */
    private DisplayDescription(div: HTMLDivElement) {

    }

    /**
	 * Creates a list editor for all the skills the user used in
	 * this moment.
	 * @param div the div to display inside of.
	 */
    private DisplaySkillUnitsGained(div: HTMLDivElement) {

    }
    
    /**
	 * Creates an editor for the skill units gained, allowing the user
	 * to view, change, and delete the path and order of the skills
     * used, as well as the units gained in that skill.
     * 
     * This function will look at the skill at the given path to
     * determine whether or not to default to the duration of this
     * moment in hours, or to default to 1.
	 * @param div the div to display inside of.
	 * @param index the index of the media file.
	 * @param refreshList a function that refreshes the list.
	 * @param refreshPage a function that refreshes the entire page.
	 */
	private DisplaySkillUnitGained(
		div: HTMLDivElement,
		index: number,
		refreshList: () => Promise<void>,
		refreshPage: () => Promise<void>
	) {

	}
}
