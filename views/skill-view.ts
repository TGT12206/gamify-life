import { Skill } from 'base-classes/skill';
import { HTMLHelper } from 'html-helper';
import { setIcon, TextFileView, TFile, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_SKILL = 'skill';
export const SKILL_EXTENSION = 'skill';

export class SkillView extends TextFileView {
	skill: Skill;
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
		return JSON.stringify(this.skill);
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

		const parentSkillDiv = mainDiv.createDiv('hbox');
		const progressDiv = mainDiv.createDiv('vbox');
		
		const descriptionDiv = mainDiv.createDiv('vbox');
		const mediaDiv = descriptionDiv.createDiv('hbox');
		const textDescriptionDiv = descriptionDiv.createDiv('hbox');

		const middleDiv = mainDiv.createDiv('hbox');
		const levelsDiv = middleDiv.createDiv('hbox');
		const unitDiv = middleDiv.createDiv('vbox');

		const subskillDiv = middleDiv.createDiv('vbox');

		this.DisplayParentSkill(parentSkillDiv);
		this.DisplayProgress(progressDiv);
		this.DisplayMediaFiles(mediaDiv);
		this.DisplayDescription(textDescriptionDiv);
		this.DisplayLevels(levelsDiv);
		this.DisplayUnit(unitDiv);
		this.DisplaySubSkills(subskillDiv);
	}

	private ParseAndReassignData(data: string) {
		const plainObj = JSON.parse(data);
		this.skill = new Skill();
		Object.assign(this.skill, plainObj);
	}

	/**
	 * Creates a div element showing the name of the parent and
	 * a button that opens the parent file. If there is no parent,
	 * this function removes the div it is given.
	 * @param div the div to display inside of.
	 */
	private DisplayParentSkill(div: HTMLDivElement) {

	}

	/**
	 * Displays the progress made in this skill in the form of a slider
	 * with a max based on the level with the highest threshold, and
	 * displays all the media associated with the levels achieved so far.
	 * @param div the div to display inside of.
	 */
	private DisplayProgress(div: HTMLDivElement) {
		
	}

	/**
	 * Creates a list editor for all the media files the user adds to
	 * this skill.
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
	 * of this skill.
	 * @param div the div to display inside of.
	 */
	private DisplayDescription(div: HTMLDivElement) {

	}
	


	/**
	 * Creates a list editor of the levels of this skill.
	 * @param div the div to display inside of.
	 */
	private DisplayLevels(div: HTMLDivElement) {

	}

	/**
	 * Creates an editor for a skill level, allowing the user to
	 * edit the name of the level, the number of units required,
	 * and the media file that represents this level.
	 * @param div the div to display inside of.
	 * @param index the index of the level.
	 * @param refreshList a function that refreshes the list.
	 * @param refreshPage a function that refreshes the entire page.
	 */
	private DisplayLevel(
		div: HTMLDivElement,
		index: number,
		refreshList: () => Promise<void>,
		refreshPage: () => Promise<void>
	) {

	}

	/**
	 * Creates an editor for the skill unit of this skill,
	 * allowing the user to edit the name of the unit as well as
	 * whether or not the unit is just the number of hours spent.
	 * @param div the div to display inside of.
	 */
	private DisplayUnit(div: HTMLDivElement) {

	}
	


	/**
	 * Creates a list editor for the subskills of this skill.
	 * @param div the div to display inside of.
	 */
	private DisplaySubSkills(div: HTMLDivElement) {
		// includes weights for each one
	}

	/**
	 * Creates an editor for the subskill, allowing the user to
	 * edit the path to the subskill and the weight given to units
	 * gained from working on this subskill.
	 * @param div the div to display inside of.
	 * @param index the index of the subskill.
	 * @param refreshList a function that refreshes the list.
	 * @param refreshPage a function that refreshes the entire page.
	 */
	private DisplaySubskill(
		div: HTMLDivElement,
		index: number,
		refreshList: () => Promise<void>,
		refreshPage: () => Promise<void>
	) {

	}
}
