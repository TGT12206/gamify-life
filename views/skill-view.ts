import { Skill, SkillHandler, SkillLevel } from 'base-classes/skill';
import { HTMLHelper } from 'html-helper';
import { MediaPathModal } from 'modals/media-path-modal';
import { SkillPathModal } from 'modals/skill-path-modal';
import { Notice, setIcon, TextFileView, TFile, WorkspaceLeaf } from 'obsidian';
import { MOMENT_EXTENSION } from './moment-view';
import { Moment } from 'base-classes/moment';

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

		this.parentSkillDiv = mainDiv.createDiv('hbox gl-bordered gl-outer-container');
		this.progressDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');
		
		this.mediaDiv = mainDiv.createDiv('hbox gl-bordered gl-outer-container');
		this.descriptionDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');

		const middleDiv = mainDiv.createDiv('gl-outer-container hbox');
		this.levelsDiv = middleDiv.createDiv('hbox gl-bordered gl-outer-container');
		this.unitDiv = middleDiv.createDiv('vbox gl-bordered gl-outer-container');
		this.unitDiv.id = 'gl-skill-unit-editor';

		this.subskillDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');

		this.DisplayParentSkill();
		this.DisplayProgress();
		HTMLHelper.DisplayMediaFiles(this.mediaDiv, this, this.skill.mediaPaths);
		this.DisplayDescription();
		this.DisplayLevels();
		this.DisplayUnit();
		this.DisplaySubskills();
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

		HTMLHelper.CreateNewTextDiv(div, 'Parent Skill:', 'gl-fit-content');
		const button = div.createEl('button', { text: parentSkill.name } );
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
	 * Displays the progress made in this skill in the form of a "slider" (2 div elements)
	 * with a max based on the level with the highest threshold, and
	 * displays all the media associated with the levels achieved so far.
	 */
	private async DisplayProgress() {
		const div = this.progressDiv;
		div.empty();
		
		let maxThreshold = 0;
		for (let i = 0; i < this.skill.levels.length; i++) {
			const currentThreshold = this.skill.levels[i].threshold;
			if (currentThreshold > maxThreshold) {
				maxThreshold = currentThreshold;
			}
		}
		if (this.file === null) {
			return;
		}
		const currentUnits = await SkillHandler.CountUnits(this.app, this.file.path);

		HTMLHelper.CreateNewTextDiv(div, 'Progress: ' + currentUnits + ' ' + this.skill.unitType.name);

		const slider = div.createDiv('hbox');
		
		const sliderFill = slider.createDiv();
		const sliderEmpty = slider.createDiv();

		sliderFill.id = 'gl-skill-slider-fill';
		sliderEmpty.id = 'gl-skill-slider-empty';

		const percentProgress = (currentUnits * 100 / maxThreshold);
		sliderFill.style.width = percentProgress + '%';
		sliderEmpty.style.width = (100 - percentProgress) + '%';
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
		HTMLHelper.CreateListEditor(
			div.createDiv(), 'gl-outer-container', false,
			this, this.skill.levels, () => { return new SkillLevel(); },
			(
				div: HTMLDivElement,
				index: number,
				refreshList: () => Promise<void>
			) => {
				this.DisplayLevel(div, index, refreshList);
			}
		);
	}

	/**
	 * Creates an editor for a skill level, allowing the user to
	 * edit the name of the level, the number of units required,
	 * and the media file that represents this level.
	 */
	private async DisplayLevel(
		div: HTMLDivElement,
		index: number,
		refreshList: () => Promise<void>
	) {
		div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-container');

        const shiftButtonsDiv = div.createDiv('hbox');

		const list = this.skill.levels;

		const refreshProgess = async () => {
			await this.DisplayProgress();
		}

        HTMLHelper.CreateShiftElementUpButton(shiftButtonsDiv, this, list, index, false, refreshList);
        HTMLHelper.CreateShiftElementDownButton(shiftButtonsDiv, this, list, index, false, refreshList);

		const name = div.createEl('input', { type: 'text', value: list[index].name } );
		const threshold = div.createEl('input', { type: 'number', value: list[index].threshold + '' } );

		const pathTextDiv = HTMLHelper.CreateNewTextDiv(div, list[index].mediaPath, 'gl-scroll');
        pathTextDiv.id = 'gl-crop-path';
        const pathButtonsDiv = div.createDiv('hbox');
        const openFileButton = pathButtonsDiv.createEl('button', { text: 'Open Link' } );
        const openModalButton = pathButtonsDiv.createEl('button', { text: 'Edit Link' } );
		const mediaDiv = div.createDiv('vbox');

        HTMLHelper.CreateDeleteButton(div, this, list, index, refreshProgess);

		const changePath = async (file: TFile) => {
            list[index].mediaPath = file.path;
            pathTextDiv.textContent = file.path;
            pathModal.close();
			this.requestSave();
        }

        const pathModal = new MediaPathModal(this.app, mediaDiv, async (file: TFile) => { await changePath(file); });

		pathModal.fetchMediaFileFromPath(list[index].mediaPath);

		this.registerDomEvent(name, 'change', () => {
			list[index].name = name.value;
			refreshProgess();
		});
		this.registerDomEvent(threshold, 'change', () => {
			list[index].threshold = parseFloat(threshold.value);
			refreshProgess();
		});
		this.registerDomEvent(openFileButton, 'click', () => {
            const tFile = this.vault.getFileByPath(list[index].mediaPath);
            if (tFile === null) {
                return new Notice(list[index].mediaPath + ' not found');
            }
            this.app.workspace.getLeaf('tab').openFile(tFile);
        });

        this.registerDomEvent(openModalButton, 'click', () => {
            pathModal.open();
        });
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
		const checkboxDiv = div.createDiv('hbox gl-outer-container');
		HTMLHelper.CreateNewTextDiv(checkboxDiv, 'Default behavior?', 'gl-fit-content');
		const doDefault = checkboxDiv.createEl('input', { type: 'checkbox' } );
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

				const data = await this.vault.cachedRead(tFile);
				const plainObj = JSON.parse(data);
				const parentSkill = new Skill();
				Object.assign(parentSkill, plainObj);

				this.skill.unitType.name = parentSkill.unitType.name;
				this.skill.unitType.isHoursSpent = parentSkill.unitType.isHoursSpent;
				
				this.requestSave();
			});
		}

		this.registerDomEvent(nameInput, 'change', () => {
			this.skill.unitType.name = nameInput.value;

			this.requestSave();
		});
		this.registerDomEvent(doDefault, 'click', () => {
			doDefault.checked = !doDefault.checked;
			this.skill.unitType.isHoursSpent = doDefault.checked;
			
			this.requestSave();
		});
	}

	/**
	 * Creates a list editor for the subskills of this skill.
	 */
	private DisplaySubskills() {
		// includes weights for each one
		const div = this.subskillDiv;
		div.empty();
		HTMLHelper.CreateListEditor(
			div.createDiv(), 'gl-outer-container', false,
			this, this.skill.subskills, () => { return { path: '', weight: 1 }; },
			(
				div: HTMLDivElement,
				index: number,
				refreshList: () => Promise<void>
			) => {
				this.DisplaySubskill(div, index, refreshList);
			}
		);
	}

	/**
	 * Creates an editor for the subskill, allowing the user to
	 * edit the path to the subskill and the weight given to units
	 * gained from working on this subskill.
	 */
	private async DisplaySubskill(
		div: HTMLDivElement,
		index: number,
		refreshList: () => Promise<void>
	) {
		div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-container');

        const shiftButtonsDiv = div.createDiv('hbox');

		const list = this.skill.subskills;
		let subskill;
		const tFile = this.vault.getFileByPath(list[index].path);
        if (tFile !== null) {
            const data = await this.vault.cachedRead(tFile);
            const plainObj = JSON.parse(data);
            subskill = new Skill();
            Object.assign(subskill, plainObj);
        }

        HTMLHelper.CreateShiftElementUpButton(shiftButtonsDiv, this, list, index, false, refreshList);
        HTMLHelper.CreateShiftElementDownButton(shiftButtonsDiv, this, list, index, false, refreshList);

		const skillNameDiv = HTMLHelper.CreateNewTextDiv(div, subskill ? subskill.name : 'New Subskill');

        const skillButtonsDiv = div.createDiv('hbox');
        const openSkill = skillButtonsDiv.createEl('button', { text: 'Open Subskill' } );
        const changeSkill = skillButtonsDiv.createEl('button', { text: 'Change Subskill' } );
		
		const weightDiv = div.createDiv('hbox gl-outer-container');
		HTMLHelper.CreateNewTextDiv(weightDiv, 'Weight: ');
        const weightInput = weightDiv.createEl('input', { type: 'number', value: list[index].weight + '' } );

        HTMLHelper.CreateDeleteButton(div, this, list, index, refreshList);

        const updateSubskill = async (file: TFile) => {
            const data = await this.vault.cachedRead(file);
            const plainObj = JSON.parse(data);
            subskill = new Skill();
            Object.assign(subskill, plainObj);
            pathModal.close();
			list[index].path = file.path;
            skillNameDiv.textContent = subskill.name;
            this.requestSave();
        }

		const pathModal = new SkillPathModal(this.app, updateSubskill);

		this.registerDomEvent(changeSkill, 'click', () => {
            pathModal.open();
        });
        this.registerDomEvent(openSkill, 'click', async () => {
            const tFile = this.vault.getFileByPath(list[index].path);
            if (tFile !== null) {
                this.app.workspace.getLeaf('tab').openFile(tFile);
            } else {
				const newSubskill = new Skill();
				newSubskill.parentSkillPath = this.file?.path;
				const newFile = await this.app.vault.create((this.file === null ? '' : (this.file.parent !== null ? this.file.parent.path + '/' : '')) + 'New Subskill.skill', JSON.stringify(newSubskill));
                this.app.workspace.getLeaf('tab').openFile(newFile);
			}
        });
		this.registerDomEvent(weightInput, 'change', () => {
			list[index].weight = parseInt(weightInput.value);
		});
	}
	
	static HandleParentSkillRename() {
		
	}
	static HandleParentSkillDelete() {
		
	}
	static HandleSubskillRename() {
		
	}
	static HandleSubskillDelete() {
		
	}
}
