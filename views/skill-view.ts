import { Skill } from 'base-classes/skill';
import { HTMLHelper } from 'html-helper';
import { MediaPathModal } from 'modals/media-path-modal';
import { Notice, setIcon, TextFileView, TFile, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_SKILL = 'skill';
export const SKILL_EXTENSION = 'skill';

export class SkillView extends TextFileView {
	skill: Skill;
	mainDiv: HTMLDivElement;
	parentSkillDiv: HTMLDivElement;
	progressDiv: HTMLDivElement;
	mediaDiv: HTMLDivElement;
	descriptionDiv: HTMLDivElement;
	levelsDiv: HTMLDivElement;
	unitDiv: HTMLDivElement;
	subskillDiv: HTMLDivElement;

	private get vault() {
		return this.app.vault;
	}

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_SKILL;
	}

	override async onLoadFile(file: TFile): Promise<void> {
		super.onLoadFile(file);
	}

	override async onRename(file: TFile): Promise<void> {
		this.skill.name = file.basename;
		this.requestSave();
	}

	getDisplayText() {
		return this.file ? this.file.basename : 'Untitled';
	}

	override async setViewData(data: string, clear: boolean): Promise<void> {
		this.Display(data);
	}

	getViewData(): string {
		return JSON.stringify(this.skill);
	}

	clear(): void {
		return;
	}

	private Display(data: string) {
		this.ParseAndReassignData(data);
		this.contentEl.empty();
		this.mainDiv = this.contentEl.createDiv('gl-main gl-outer-container vbox');

		const mainDiv = this.mainDiv;

		this.parentSkillDiv = mainDiv.createDiv('hbox gl-bordered');
		this.progressDiv = mainDiv.createDiv('vbox gl-bordered');
		
		this.mediaDiv = mainDiv.createDiv('hbox gl-bordered');
		this.descriptionDiv = mainDiv.createDiv('vbox gl-bordered');

		const middleDiv = mainDiv.createDiv('gl-outer-container hbox');
		this.levelsDiv = middleDiv.createDiv('hbox gl-bordered');
		this.unitDiv = middleDiv.createDiv('vbox gl-bordered');

		this.subskillDiv = mainDiv.createDiv('vbox gl-bordered');

		this.DisplayParentSkill();
		this.DisplayProgress();
		HTMLHelper.DisplayMediaFiles(this.mediaDiv, this, this.skill.mediaPaths);
		this.DisplayDescription();
		this.DisplayLevels();
		this.DisplayUnit();
		this.DisplaySubSkills();
	}

	private ParseAndReassignData(data: string) {
		const plainObj = JSON.parse(data);
		this.skill = new Skill();
		Object.assign(this.skill, plainObj);
		if (this.skill.name === undefined) {
			this.skill.name = this.getDisplayText();
		}
	}

	/**
	 * Creates a div element showing the name of the parent and
	 * a button that opens the parent file. If there is no parent,
	 * this function just empties the div.
	 */
	private async DisplayParentSkill() {
		const div = this.parentSkillDiv;
		div.empty();

		const parentPath = this.skill.parentSkillPath;

		if (parentPath === undefined) {
			return div.empty();
		}

		const tFile = this.vault.getFileByPath(parentPath);

		if (tFile === null) {
			return div.empty();
		}
		const data = await this.vault.cachedRead(tFile);
		const plainObj = JSON.parse(data);
		const parentSkill = new Skill();
		Object.assign(parentSkill, plainObj);

		HTMLHelper.CreateNewTextDiv(div, 'Parent Skill:');
		const button = HTMLHelper.CreateNewTextDiv(div, parentSkill.name, 'pointer-hover');
		this.registerDomEvent(button, 'click', () => {
		const parentPath = this.skill.parentSkillPath;
			if (parentPath === undefined) {
				return new Notice('Parent no longer exists');
			}
			const tFile = this.vault.getFileByPath(parentPath);
			if (tFile === null) {
				return new Notice(parentPath + ' not found');
			}
			this.app.workspace.getLeaf('tab').openFile(tFile);
		});
	}

	/**
	 * Displays the progress made in this skill in the form of a slider
	 * with a max based on the level with the highest threshold, and
	 * displays all the media associated with the levels achieved so far.
	 */
	private DisplayProgress() {
		const div = this.progressDiv;
		div.empty();
		
	}

	/**
	 * Creates a textarea for the user to edit the description
	 * of this skill.
	 */
	private DisplayDescription() {
		const div = this.descriptionDiv;
		div.empty();
		const input = div.createEl('textarea', { text: this.skill.description } );
		this.registerDomEvent(input, 'change', () => {
			this.skill.description = input.value;
			this.requestSave();
		});
	}
	


	/**
	 * Creates a list editor of the levels of this skill.
	 */
	private DisplayLevels() {
		const div = this.levelsDiv;
		div.empty();
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
	 */
	private DisplayUnit() {
		const div = this.unitDiv;
		div.empty();
		const nameInput = div.createEl('input', { type: 'text', value: this.skill.unitType.name } );
		HTMLHelper.CreateNewTextDiv(div, 'Default (Hrs Spent):');
		const doDefault = div.createEl('input', { type: 'checkbox' } );
		doDefault.checked = this.skill.unitType.isHoursSpent;
		if (this.skill.parentSkillPath !== undefined) {
			const setToSameAsParent = div.createEl('button', { text: 'Reset to parent unit' } );
			this.registerDomEvent(setToSameAsParent, 'click', async () => {
				const parentPath = this.skill.parentSkillPath;

				if (parentPath === undefined) {
					return div.empty();
				}

				const tFile = this.vault.getFileByPath(parentPath);

				if (tFile === null) {
					return div.empty();
				}
				this.skill.unitType.name = tFile.basename;
			});
		}

		this.registerDomEvent(nameInput, 'change', () => {
			this.skill.unitType.name = nameInput.value;
		});
		this.registerDomEvent(doDefault, 'click', () => {
			doDefault.checked = !doDefault.checked;
			this.skill.unitType.isHoursSpent = doDefault.checked;
		});
	}

	/**
	 * Creates a list editor for the subskills of this skill.
	 */
	private DisplaySubSkills() {
		// includes weights for each one
		const div = this.subskillDiv;
		div.empty();
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
