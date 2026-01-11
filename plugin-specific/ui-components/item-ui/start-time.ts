import { Quest, StartTime } from "plugin-specific/models/quest";
import { GamifyLifeView } from "plugin-specific/ui-components/gamify-life-view";
import { ArrayItemUI } from "ui-patterns/array-item-ui";
import { HTMLHelper } from "ui-patterns/html-helper";

export class StartTimeUI extends ArrayItemUI<StartTime> {
    get quest(): Quest {
        return <Quest> this.globalData;
    }
    set quest(newQuest: Quest) {
        this.globalData = newQuest;
    }

    constructor(quest: Quest) {
        super();
        this.quest = quest;
    }

    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: StartTime[],
        startTime: StartTime,
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-div');

        this.MakeIntervalSpecificEditors(view, div, startTime, onRefresh);
        
        this.MakeDeleteButton(view, div, mainArray, startTime, onRefresh);
    }

    MakeIntervalSpecificEditors(
        view: GamifyLifeView,
        div: HTMLDivElement,
        startTime: StartTime,
        onRefresh: (() => Promise<void>)
    ): void {
        switch(this.quest.type) {
            case 'Yearly':
                this.MakeMonthOfYearEditor(view, div, startTime, onRefresh);
            case 'Monthly':
                this.MakeDayOfMonthEditor(view, div, startTime, onRefresh);
                this.MakeHourMinuteEditor(view, div, startTime, onRefresh);
                break;
            case 'Weekly':
                this.MakeWeekdayEditor(view, div, startTime, onRefresh);
            case 'Daily':
                this.MakeHourMinuteEditor(view, div, startTime, onRefresh);
                break;
        }
    }

    MakeMonthOfYearEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        startTime: StartTime,
        onRefresh: (() => Promise<void>)
    ) {
        const month = div.createEl('select');
            month.createEl('option', { text: 'January', value: '0' } );
            month.createEl('option', { text: 'February', value: '1' } );
            month.createEl('option', { text: 'March', value: '2' } );
            month.createEl('option', { text: 'April', value: '3' } );
            month.createEl('option', { text: 'May', value: '4' } );
            month.createEl('option', { text: 'June', value: '5' } );
            month.createEl('option', { text: 'July', value: '6' } );
            month.createEl('option', { text: 'August', value: '7' } );
            month.createEl('option', { text: 'September', value: '8' } );
            month.createEl('option', { text: 'October', value: '9' } );
            month.createEl('option', { text: 'November', value: '10' } );
            month.createEl('option', { text: 'December', value: '11' } );
        month.value = startTime.month + '';

        view.registerDomEvent(month, 'change', async () => {
            startTime.month = parseInt(month.value);
            await onRefresh();
        });
    }
    
    MakeDayOfMonthEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        startTime: StartTime,
        onRefresh: (() => Promise<void>)
    ) {
        const mDiv = div.createDiv('hbox gl-outer-div');
        HTMLHelper.CreateNewTextDiv(mDiv, 'Day of month:', 'gl-fit-content');
        const d = mDiv.createEl('input', { type: 'number', value: startTime.day + '' } );
        d.min = '1';
        d.max = '31';

        view.registerDomEvent(d, 'change', async () => {
            startTime.day = parseInt(d.value);
            await onRefresh();
        });
    }
    
    MakeWeekdayEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        startTime: StartTime,
        onRefresh: (() => Promise<void>)
    ) {
        const weekday = div.createEl('select');
            // This strange order is to match the order of Date.getDay,
            // while keeping the visual order the same as what I want it to be lol
            weekday.createEl('option', { text: 'Monday', value: '1' } );
            weekday.createEl('option', { text: 'Tuesday', value: '2' } );
            weekday.createEl('option', { text: 'Wednesday', value: '3' } );
            weekday.createEl('option', { text: 'Thursday', value: '4' } );
            weekday.createEl('option', { text: 'Friday', value: '5' } );
            weekday.createEl('option', { text: 'Saturday', value: '6' } );
            weekday.createEl('option', { text: 'Sunday', value: '0' } );
        weekday.value = startTime.day + '';

        view.registerDomEvent(weekday, 'change', async () => {
            startTime.day = parseInt(weekday.value);
            await onRefresh();
        });
    }

    MakeHourMinuteEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        startTime: StartTime,
        onRefresh: (() => Promise<void>)
    ) {
        const hmDiv = div.createDiv('hbox gl-outer-div');
        const h = hmDiv.createEl('input', { type: 'number', value: startTime.hour + '' } );
        h.min = '1';
        h.max = '12';
        HTMLHelper.CreateNewTextDiv(hmDiv, ':', 'gl-fit-content');
        const m = hmDiv.createEl('input', { type: 'number', value: startTime.minute + '' } );
        m.min = '0';
        m.max = '59';
        
        const sel = hmDiv.createEl('select');
            sel.createEl('option', { text: 'AM', value: 'AM' } );
            sel.createEl('option', { text: 'PM', value: 'PM' } );
        sel.value = startTime.hour >= 12 ? 'AM' : 'PM';
        
        view.registerDomEvent(h, 'change', () => {
            const am = sel.value === 'AM';
            startTime.hour = parseInt(h.value) + (am ? 0 : 12);
            onRefresh();
        });
        view.registerDomEvent(m, 'change', () => {
            startTime.minute = parseInt(m.value);
            onRefresh();
        });
        view.registerDomEvent(sel, 'change', () => {
            const am = sel.value === 'AM';
            startTime.hour = parseInt(h.value) + (am ? 0 : 12);
            onRefresh();
        });
    }
}