import { HTMLHelper } from "ui-patterns/html-helper";
import { ConceptEditorUIMaker } from "./concept";
import { ListEditor } from "ui-patterns/list-editor";
import { GamifyLifeView } from "../gamify-life-view";
import { GainedSkillUnit, Skill, SkillUnit } from "plugin-specific/models/skill";
import { Moment } from "plugin-specific/models/moment";
import { setIcon } from "obsidian";
import { KeyService } from "plugin-specific/services/key";
import { ConceptKeyListEditor } from "../list-editors/concept-key";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { ConceptKeySuggest } from "../suggest/concept-key-suggest";
import { KeyValue } from "plugin-specific/models/key-value";
import { ConceptService } from "plugin-specific/services/concept";

export class MomentEditorUIMaker extends ConceptEditorUIMaker {
    override MakeUI(view: GamifyLifeView, div: HTMLDivElement, moment: Moment) {
        super.MakeUI(view, div, moment);
        this.MakeConceptKeysEditor(view, div.createDiv(), moment);
        this.MakeDateTimeEditor(view, div.createDiv(), moment);
        this.MakeGainedSkillUnitsEditor(view, div.createDiv(), moment);
    }

    protected MakeConceptKeysEditor(view: GamifyLifeView, div: HTMLDivElement, moment: Moment) {
        div.className = 'hbox';
        HTMLHelper.CreateNewTextDiv(div, 'Concepts involved:');
        const listEditor = new ConceptKeyListEditor(moment, div.createDiv(), moment.conceptKeys, view.onSave);
        listEditor.Render(view);
    }

    protected MakeDateTimeEditor(view: GamifyLifeView, div: HTMLDivElement, moment: Moment) {
        div.className = 'hbox gl-outer-div';
        const startDiv = div.createDiv('vbox gl-outer-div');
        const endDiv = div.createDiv('vbox gl-outer-div');

        let startLocked = false;
        let endLocked = true;

        const lockStart = startDiv.createEl('button');
        HTMLHelper.CreateNewTextDiv(startDiv, 'Start Time and Date');
        
        const startInputDiv = startDiv.createDiv('hbox gl-outer-container');
        const startDate = startInputDiv.createEl('input', { type: 'datetime-local', value: HTMLHelper.DateToDateTimeLocalString(moment.startTime) } );

        const lockEnd = endDiv.createEl('button');
        HTMLHelper.CreateNewTextDiv(endDiv, 'End Time and Date');

        const endInputDiv = endDiv.createDiv('hbox gl-outer-container');
        const endDate = endInputDiv.createEl('input', { type: 'datetime-local', value: HTMLHelper.DateToDateTimeLocalString(moment.endTime) } );

        HTMLHelper.CreateNewTextDiv(div, 'Duration');
        const durationDiv = div.createDiv('hbox gl-outer-container');

        let minuteOffset = (moment.endTime.getTime() - moment.startTime.getTime()) / (1000 * 60);
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

        setIcon(lockStart, 'lock-open');
        setIcon(lockEnd, 'lock');

        startDate.disabled = startLocked;
        endDate.disabled = endLocked;

        view.registerDomEvent(lockStart, 'click', () => {
            startLocked = !startLocked;
            endLocked = !endLocked;

            setIcon(lockStart, startLocked ? 'lock' : 'lock-open');
            setIcon(lockEnd, endLocked ? 'lock' : 'lock-open');

            startDate.disabled = startLocked;
            endDate.disabled = endLocked;
        });
        view.registerDomEvent(lockEnd, 'click', () => {
            startLocked = !startLocked;
            endLocked = !endLocked;

            setIcon(lockStart, startLocked ? 'lock' : 'lock-open');
            setIcon(lockEnd, endLocked ? 'lock' : 'lock-open');

            startDate.disabled = startLocked;
            endDate.disabled = endLocked;
        });
        view.registerDomEvent(startDate, 'change', async () => {
            moment.startTime = new Date(startDate.value);

            const offset = moment.endTime.getTime() - moment.startTime.getTime();
            const days = Math.floor(offset / (1000 * 60 * 60 * 24));
            const hours = Math.floor((offset % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((offset % (1000 * 60 * 60)) / (1000 * 60));

            day.value = days + '';
            hour.value = hours + '';
            minute.value = minutes + '';

            await view.onSave();
        });
        view.registerDomEvent(endDate, 'change', async () => {
            moment.endTime = new Date(endDate.value);
            
            const offset = moment.endTime.getTime() - moment.startTime.getTime();
            const days = Math.floor(offset / (1000 * 60 * 60 * 24));
            const hours = Math.floor((offset % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((offset % (1000 * 60 * 60)) / (1000 * 60));

            day.value = days + '';
            hour.value = hours + '';
            minute.value = minutes + '';
            
            await view.onSave();
        });
        view.registerDomEvent(day, 'change', async () => {
            const offset = ((parseInt(day.value) * 60 * 24) + (parseInt(hour.value) * 60) + parseInt(minute.value)) * 1000 * 60;
            if (startLocked) {
                moment.endTime.setTime(moment.startTime.getTime() + offset);
                endDate.value = HTMLHelper.DateToDateTimeLocalString(moment.endTime);
            } else {
                moment.startTime.setTime(moment.endTime.getTime() - offset);
                startDate.value = HTMLHelper.DateToDateTimeLocalString(moment.startTime);
            }
            await view.onSave();
        });
        view.registerDomEvent(hour, 'change', async () => {
            const offset = ((parseInt(day.value) * 60 * 24) + (parseInt(hour.value) * 60) + parseInt(minute.value)) * 1000 * 60;
            if (startLocked) {
                moment.endTime.setTime(moment.startTime.getTime() + offset);
                endDate.value = HTMLHelper.DateToDateTimeLocalString(moment.endTime);
            } else {
                moment.startTime.setTime(moment.endTime.getTime() - offset);
                startDate.value = HTMLHelper.DateToDateTimeLocalString(moment.startTime);
            }
            await view.onSave();
        });
        view.registerDomEvent(minute, 'change', async () => {
            const offset = ((parseInt(day.value) * 60 * 24) + (parseInt(hour.value) * 60) + parseInt(minute.value)) * 1000 * 60;
            if (startLocked) {
                moment.endTime.setTime(moment.startTime.getTime() + offset);
                endDate.value = HTMLHelper.DateToDateTimeLocalString(moment.endTime);
            } else {
                moment.startTime.setTime(moment.endTime.getTime() - offset);
                startDate.value = HTMLHelper.DateToDateTimeLocalString(moment.startTime);
            }
            await view.onSave();
        });
    }
    protected MakeGainedSkillUnitsEditor(view: GamifyLifeView, div: HTMLDivElement, moment: Moment) {
        div.className = 'hbox';
        HTMLHelper.CreateNewTextDiv(div, 'Gained Skill Units:');
        const listEditor = new GainedSkillUnitListEditor(moment, div.createDiv(), moment.skillUnitsGained, view.onSave);
        listEditor.Render(view);
    }
}

//#region Gained Skill Units
export class GainedSkillUnitUIMaker extends ObjUIMaker<GainedSkillUnit> {
    get moment(): Moment {
        return <Moment> this.globalData;
    }
    set moment(newMoment: Moment) {
        this.globalData = newMoment;
    }

    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: GainedSkillUnit[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        const life = view.life;
        const moment = this.moment;
        const unitGained = mainArray[index];
        const getUnitType = (unitGained: GainedSkillUnit) => {
            try {
                const skillIndex = KeyService.FindKey(life.concepts, unitGained.skillKey);
                const skill = <Skill> life.concepts[skillIndex].value;
                const unitTypeIndex = KeyService.FindKey(life.concepts, skill.unitKey);
                const unitType = <SkillUnit> life.concepts[unitTypeIndex].value;
                return unitType;
            } catch {
                return undefined
            }
        }
        const unitType = getUnitType(unitGained);

        if (getUnitType(unitGained) === undefined) {
            const startTime = moment.startTime.getTime();
            const endTime = moment.endTime.getTime();
            unitGained.unitsGained = (endTime - startTime) / 3600000;
        }

        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        const shiftButtonsDiv = itemDiv.createDiv(this.isVertical ? 'hbox' : 'vbox');

        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'left' : 'up', onRefresh);
        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'right' : 'down', onRefresh);

        const numUnitsDiv = itemDiv.createDiv('hbox');
        HTMLHelper.CreateNewTextDiv(itemDiv, 'Skill:');
        const skillKeyInput = itemDiv.createEl('input', { type: 'text', value: ConceptService.GetNameFromKey(life, unitGained.skillKey) } );

        const unitGainedInput = numUnitsDiv.createEl('input', { type: 'number', value: unitGained.unitsGained + '' } );
        HTMLHelper.CreateNewTextDiv(numUnitsDiv, unitType ? unitType.name : 'Hours Spent');

        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        const updateSkillKey = async (skillKV: KeyValue<Skill>) => {
            mainArray[index].skillKey = skillKV.key;
            await onSave();
        };
        new ConceptKeySuggest(skillKeyInput, view.life, undefined, view.app, updateSkillKey, ['Skill']);

        view.registerDomEvent(unitGainedInput, 'change', async () => {
            unitGained.unitsGained = parseFloat(unitGainedInput.value);
            await onSave();
        });
    }
}

export class GainedSkillUnitListEditor extends ListEditor<GainedSkillUnit> {
    constructor(moment: Moment, parentDiv: HTMLDivElement, gainedSkillUnits: GainedSkillUnit[], onSave: () => Promise<void>) {
        const uiMaker = new GainedSkillUnitUIMaker();
        super(moment, parentDiv, gainedSkillUnits, () => { return new GainedSkillUnit() }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}
//#endregion Gained Skill Units