import { HTMLHelper } from "ui-patterns/html-helper";
import { ConceptLoader } from "./concept";
import { GamifyLifeView } from "../gamify-life-view";
import { Moment } from "plugin-specific/models/moment";
import { setIcon } from "obsidian";
import { ConceptKeyArrayEditor } from "../list-editors/concept-key";
import { EarnedSkillUnitArrayEditor } from "../list-editors/earned-skill-unit";

export class MomentLoader extends ConceptLoader {
    override Load(view: GamifyLifeView, div: HTMLDivElement, moment: Moment, doCheck: boolean = false) {
        super.Load(view, div, moment, doCheck);
        this.MakeConceptKeysEditor(view, div.createDiv(), moment);
        this.MakeDateTimeEditor(view, div.createDiv(), moment);
        this.MakeEarnedSkillUnitsEditor(view, div.createDiv(), moment);
    }

    MakeConceptKeysEditor(view: GamifyLifeView, div: HTMLDivElement, moment: Moment) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Concepts involved:');
        new ConceptKeyArrayEditor(moment, div.createDiv(), view);
    }

    MakeDateTimeEditor(view: GamifyLifeView, div: HTMLDivElement, moment: Moment) {
        div.className = 'hbox gl-outer-div';
        const startDiv = div.createDiv('vbox gl-outer-div');
        const endDiv = div.createDiv('vbox gl-outer-div');

        let startLocked = false;
        let endLocked = true;

        const lockStart = startDiv.createEl('button');
        HTMLHelper.CreateNewTextDiv(startDiv, 'Start Time and Date');
        
        const startInputDiv = startDiv.createDiv('hbox gl-outer-div');
        const startDate = startInputDiv.createEl('input', { type: 'datetime-local', value: HTMLHelper.DateToDateTimeLocalString(moment.startTime) } );

        const lockEnd = endDiv.createEl('button');
        HTMLHelper.CreateNewTextDiv(endDiv, 'End Time and Date');

        const endInputDiv = endDiv.createDiv('hbox gl-outer-div');
        const endDate = endInputDiv.createEl('input', { type: 'datetime-local', value: HTMLHelper.DateToDateTimeLocalString(moment.endTime) } );

        HTMLHelper.CreateNewTextDiv(div, 'Duration');
        const durationDiv = div.createDiv('hbox gl-outer-div');

        let minuteOffset = (moment.endTime.getTime() - moment.startTime.getTime()) / (1000 * 60);
        let dayOffset = Math.floor(minuteOffset / (60 * 24));
        minuteOffset -= dayOffset * 60 * 24;
        let hourOffset = Math.floor(minuteOffset / (60));
        minuteOffset -= hourOffset * 60;

        const dayDiv = durationDiv.createDiv('vbox gl-outer-div');
        HTMLHelper.CreateNewTextDiv(dayDiv, 'Days');
        const day = dayDiv.createEl('input', { type: 'number', value: dayOffset + '' } );

        const hourDiv = durationDiv.createDiv('vbox gl-outer-div');
        HTMLHelper.CreateNewTextDiv(hourDiv, 'Hours');
        const hour = hourDiv.createEl('input', { type: 'number', value: hourOffset + '' } );

        const minuteDiv = durationDiv.createDiv('vbox gl-outer-div');
        HTMLHelper.CreateNewTextDiv(minuteDiv, 'Minutes');
        const minute = minuteDiv.createEl('input', { type: 'number', value: minuteOffset + '' } );

        setIcon(lockStart, 'lock-open');
        setIcon(lockEnd, 'lock');

        view.registerDomEvent(lockStart, 'click', () => {
            startLocked = !startLocked;
            endLocked = !endLocked;

            setIcon(lockStart, startLocked ? 'lock' : 'lock-open');
            setIcon(lockEnd, endLocked ? 'lock' : 'lock-open');
        });
        view.registerDomEvent(lockEnd, 'click', () => {
            startLocked = !startLocked;
            endLocked = !endLocked;

            setIcon(lockStart, startLocked ? 'lock' : 'lock-open');
            setIcon(lockEnd, endLocked ? 'lock' : 'lock-open');
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
    MakeEarnedSkillUnitsEditor(view: GamifyLifeView, div: HTMLDivElement, moment: Moment) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Gained Skill Units:');
        new EarnedSkillUnitArrayEditor(moment, div.createDiv(), view);
    }
}