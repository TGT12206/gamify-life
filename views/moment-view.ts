import { Moment } from 'base-classes/moment';
import { GainedSkillUnit, Skill } from 'base-classes/skill';
import { HTMLHelper } from 'html-helper';
import { MediaPathModal } from 'modals/media-path-modal';
import { SkillPathModal } from 'modals/skill-path-modal';
import { Notice, setIcon, TextFileView, TFile, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_MOMENT = 'moment';
export const MOMENT_EXTENSION = 'moment';

export class MomentView extends TextFileView {
    moment: Moment;
    mainDiv: HTMLDivElement;
    dateDiv: HTMLDivElement;
    mediaDiv: HTMLDivElement;
    descriptionDiv: HTMLDivElement;
    skillDiv: HTMLDivElement;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    private get vault() {
        return this.app.vault;
    }

    getViewType() {
        return VIEW_TYPE_MOMENT;
    }

    override async onLoadFile(file: TFile): Promise<void> {
        super.onLoadFile(file);
    }

    override async onRename(file: TFile): Promise<void> {
        this.moment.name = file.basename;
        this.requestSave();
    }

    getDisplayText() {
        return this.file ? this.file.basename : 'Untitled';
    }

    override async setViewData(data: string, clear: boolean): Promise<void> {
        this.Display(data);
    }

    getViewData(): string {
        return JSON.stringify(this.moment);
    }

    clear(): void {
        return;
    }

    private Display(data: string) {
        this.ParseAndReassignData(data);
        this.contentEl.empty();
        this.mainDiv = this.contentEl.createDiv('gl-main gl-outer-container vbox');

		const mainDiv = this.mainDiv;

		this.dateDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');

		this.mediaDiv = mainDiv.createDiv('hbox gl-bordered');
		this.descriptionDiv = mainDiv.createDiv('hbox gl-bordered');

		this.skillDiv = mainDiv.createDiv('hbox gl-bordered');

		this.DisplayDateInfo();
		HTMLHelper.DisplayMediaFiles(this.mediaDiv, this, this.moment.mediaPaths);
		this.DisplayDescription();
		this.DisplaySkillUnitsGained();
    }

    private ParseAndReassignData(data: string) {
        const plainObj = JSON.parse(data);
        this.moment = new Moment();
        Object.assign(this.moment, plainObj);
        this.moment.startTime = new Date(this.moment.startTime);
        this.moment.endTime = new Date(this.moment.endTime);
    }

    /**
	 * Create an editor allowing the user to set the start date/time,
     * the end date/time, and lock either the start or end and change
     * the duration, which changes the unlocked date/time accordingly.
     * 
     * The end date defaults to the current time, and the start date
     * defaults to an hour before the current time.
	 */
    private DisplayDateInfo() {
        const div = this.dateDiv;
        div.empty();
        
        const timeDiv = div.createDiv('hbox gl-outer-container');
        
        const startDiv = timeDiv.createDiv('vbox gl-outer-container');
        const endDiv = timeDiv.createDiv('vbox gl-outer-container');

        let startLocked = true;
        let endLocked = false;

        const lockStart = startDiv.createEl('button', { text: 'Lock' } );
        HTMLHelper.CreateNewTextDiv(startDiv, 'Start Time and Date');
        
        const startInputDiv = startDiv.createDiv('hbox gl-outer-container');
        const startDate = startInputDiv.createEl('input', { type: 'datetime-local', value: HTMLHelper.DateToDateTimeLocalString(this.moment.startTime) } );

        const lockEnd = endDiv.createEl('button', { text: 'Lock' } );
        HTMLHelper.CreateNewTextDiv(endDiv, 'End Time and Date');

        const endInputDiv = endDiv.createDiv('hbox gl-outer-container');
        const endDate = endInputDiv.createEl('input', { type: 'datetime-local', value: HTMLHelper.DateToDateTimeLocalString(this.moment.endTime) } );

        HTMLHelper.CreateNewTextDiv(div, 'Duration');
        const durationDiv = div.createDiv('hbox gl-outer-container');

        let minuteOffset = (this.moment.endTime.getTime() - this.moment.startTime.getTime()) / (1000 * 60);
        let dayOffset = Math.floor(minuteOffset / (60 * 24));
        minuteOffset -= dayOffset * 60 * 24;
        let hourOffset = Math.floor(minuteOffset / (60));
        minuteOffset -= hourOffset * 60;

        const dayDiv = durationDiv.createDiv('vbox gl-outer-container');
        HTMLHelper.CreateNewTextDiv(dayDiv, 'Days');
        const day = dayDiv.createEl('input', { type: 'number', value: dayOffset + '' } );

        const hourDiv = durationDiv.createDiv('vbox gl-outer-container');
        HTMLHelper.CreateNewTextDiv(hourDiv, 'Hours');
        const hour = hourDiv.createEl('input', { type: 'number', value: hourOffset + '' } );

        const minuteDiv = durationDiv.createDiv('vbox gl-outer-container');
        HTMLHelper.CreateNewTextDiv(minuteDiv, 'Minutes');
        const minute = minuteDiv.createEl('input', { type: 'number', value: minuteOffset + '' } );

        setIcon(lockStart, 'lock');
        setIcon(lockEnd, 'lock-open');

        startDate.disabled = startLocked;
        endDate.disabled = endLocked;

        this.registerDomEvent(lockStart, 'click', () => {
            startLocked = !startLocked;
            endLocked = !endLocked;

            setIcon(lockStart, startLocked ? 'lock' : 'lock-open');
            setIcon(lockEnd, endLocked ? 'lock' : 'lock-open');

            startDate.disabled = startLocked;
            endDate.disabled = endLocked;
        });
        this.registerDomEvent(lockEnd, 'click', () => {
            startLocked = !startLocked;
            endLocked = !endLocked;

            setIcon(lockStart, startLocked ? 'lock' : 'lock-open');
            setIcon(lockEnd, endLocked ? 'lock' : 'lock-open');

            startDate.disabled = startLocked;
            endDate.disabled = endLocked;
        });
        this.registerDomEvent(startDate, 'change', () => {
            this.moment.startTime = new Date(startDate.value);

            this.requestSave();
        });
        this.registerDomEvent(endDate, 'change', () => {
            this.moment.endTime = new Date(endDate.value);

            this.requestSave();
        });
        this.registerDomEvent(day, 'change', () => {
            const offset = ((parseInt(day.value) * 60 * 24) + (parseInt(hour.value) * 60) + parseInt(minute.value)) * 1000 * 60;
            if (startLocked) {
                this.moment.endTime.setTime(this.moment.startTime.getTime() + offset);
                endDate.value = HTMLHelper.DateToDateTimeLocalString(this.moment.endTime);
            } else {
                this.moment.startTime.setTime(this.moment.endTime.getTime() - offset);
                startDate.value = HTMLHelper.DateToDateTimeLocalString(this.moment.startTime);
            }

            this.requestSave();
        });
        this.registerDomEvent(hour, 'change', () => {
            const offset = ((parseInt(day.value) * 60 * 24) + (parseInt(hour.value) * 60) + parseInt(minute.value)) * 1000 * 60;
            if (startLocked) {
                this.moment.endTime.setTime(this.moment.startTime.getTime() + offset);
                endDate.value = HTMLHelper.DateToDateTimeLocalString(this.moment.endTime);
            } else {
                this.moment.startTime.setTime(this.moment.endTime.getTime() - offset);
                startDate.value = HTMLHelper.DateToDateTimeLocalString(this.moment.startTime);
            }

            this.requestSave();
        });
        this.registerDomEvent(minute, 'change', () => {
            const offset = ((parseInt(day.value) * 60 * 24) + (parseInt(hour.value) * 60) + parseInt(minute.value)) * 1000 * 60;
            if (startLocked) {
                this.moment.endTime.setTime(this.moment.startTime.getTime() + offset);
                endDate.value = HTMLHelper.DateToDateTimeLocalString(this.moment.endTime);
            } else {
                this.moment.startTime.setTime(this.moment.endTime.getTime() - offset);
                startDate.value = HTMLHelper.DateToDateTimeLocalString(this.moment.startTime);
            }

            this.requestSave();
        });
    }

    /**
	 * Creates a textarea for the user to edit the description
	 * of this moment.
	 */
    private DisplayDescription() {
		const div = this.descriptionDiv;
		div.empty();
		const input = div.createEl('textarea', { text: this.moment.description } );
		this.registerDomEvent(input, 'change', () => {
			this.moment.description = input.value;
			this.requestSave();
		})
    }

    /**
	 * Creates a list editor for all the skills the user used in
	 * this moment.
	 */
    private DisplaySkillUnitsGained() {
        const div = this.skillDiv;
        div.empty();
        HTMLHelper.CreateListEditor(
            div.createDiv(), 'gl-outer-container', false,
            this, this.moment.skillUnitsGained,
            () => { return new GainedSkillUnit(); },
            async (
                div: HTMLDivElement,
                index: number,
                refreshList: () => Promise<void>
            ) => {
                await this.DisplaySkillUnitGained(div, index, refreshList);
            }
        );
    }
    
    /**
	 * Creates an editor for the skill units gained, allowing the user
	 * to view, change, and delete the path and order of the skills
     * used, as well as the units gained in that skill.
     * 
     * This function will look at the skill at the given path to
     * determine whether or not to default to the duration of this
     * moment in hours, or to default to 1.
	 */
	private async DisplaySkillUnitGained(
		div: HTMLDivElement,
		index: number,
		refreshList: () => Promise<void>
	) {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-container');
        const mainList = this.moment.skillUnitsGained;
        const unitGained = this.moment.skillUnitsGained[index];
        let skill;
        let unitType;

        const tFile = this.vault.getFileByPath(unitGained.skillPath);
        if (tFile !== null) {
            const data = await this.vault.cachedRead(tFile);
            const plainObj = JSON.parse(data);
            skill = new Skill();
            Object.assign(skill, plainObj);
            unitType = skill.unitType;
        }

        const shiftButtonsDiv = div.createDiv('hbox');

        HTMLHelper.CreateShiftElementUpButton(shiftButtonsDiv, this, mainList, index, false, refreshList);
        HTMLHelper.CreateShiftElementDownButton(shiftButtonsDiv, this, mainList, index, false, refreshList);

        const skillNameDiv = HTMLHelper.CreateNewTextDiv(div, skill ? skill.name : 'Unassigned skill');

        const skillButtonsDiv = div.createDiv('hbox');
        const openSkill = skillButtonsDiv.createEl('button', { text: 'Open Skill' } );
        const changeSkill = skillButtonsDiv.createEl('button', { text: 'Change Skill' } );

        const numUnitsDiv = div.createDiv('hbox');
        if (unitType === undefined || unitGained.unitsGained === undefined) {
            const startTime = this.moment.startTime.getTime();
            const endTime = this.moment.endTime.getTime();
            unitGained.unitsGained = (endTime - startTime) / 3600000;
        }
        numUnitsDiv.createEl('input', { type: 'number', value: unitGained.unitsGained + '' } );
        HTMLHelper.CreateNewTextDiv(numUnitsDiv, unitType ? unitType.name : 'Hours Spent');

        HTMLHelper.CreateDeleteButton(div, this, mainList, index, refreshList);

        const updateSkill = async (file: TFile) => {
            const data = await this.vault.cachedRead(file);
            const plainObj = JSON.parse(data);
            skill = new Skill();
            Object.assign(skill, plainObj);
            unitType = skill.unitType;
            pathModal.close();
            unitGained.skillPath = file.path;
            skillNameDiv.textContent = skill.name;
            this.requestSave();
        }

        const pathModal = new SkillPathModal(this.app, updateSkill);

        this.registerDomEvent(changeSkill, 'click', () => {
            pathModal.open();
        });
        this.registerDomEvent(openSkill, 'click', () => {
            const tFile = this.vault.getFileByPath(unitGained.skillPath);
            if (tFile !== null) {
                this.app.workspace.getLeaf('tab').openFile(tFile);
            }
        });
	}
}
