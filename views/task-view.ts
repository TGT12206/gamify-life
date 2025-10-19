import { HTMLHelper } from 'html-helper';
import { TextFileView, WorkspaceLeaf } from 'obsidian';
import { StartTime, Task, TaskType, taskTypes } from 'base-classes/task';

export const VIEW_TYPE_TASK = 'task';
export const TASK_EXTENSION = 'task';

export class TaskView extends TextFileView {
    task: Task;
    mainDiv: HTMLDivElement;
    completionDiv: HTMLDivElement;
    typeDiv: HTMLDivElement;
    timeDiv: HTMLDivElement;
    mediaDiv: HTMLDivElement;
    descriptionDiv: HTMLDivElement;

    protected get vault() {
        return this.app.vault;
    }

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_TASK;
    }

    override async setViewData(data: string, clear: boolean): Promise<void> {
        this.Display(data);
    }

    getViewData(): string {
        return JSON.stringify(this.task);
    }

    clear(): void {
        return;
    }

    Display(data: string) {
        this.ParseAndReassignData(data);
        this.contentEl.empty();
        this.mainDiv = this.contentEl.createDiv('gl-main gl-outer-container vbox');

        const mainDiv = this.mainDiv;

        this.completionDiv = mainDiv.createDiv('hbox gl-bordered gl-outer-container');
        this.typeDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');
        
        this.mediaDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');
        this.descriptionDiv = mainDiv.createDiv('vbox gl-bordered gl-outer-container');

        this.DisplayCompletion();
        this.DisplayType();
        HTMLHelper.DisplayMediaFiles(this.mediaDiv, this, this.task.mediaPaths);
        this.DisplayDescription();
    }

    private ParseAndReassignData(data: string) {
        const plainObj = JSON.parse(data);
        this.task = new Task();
        Object.assign(this.task, plainObj);
    }
    
    private DisplayCompletion() {
        const div = this.completionDiv;
        div.empty();
        HTMLHelper.CreateNewTextDiv(div, 'Completed?', 'gl-fit-content');
        const completed = div.createEl('input', { type: 'checkbox' } );
        if (this.task.completionDates.length === 0) {
            completed.checked = false;
        } else if (this.task.type === 'one-off') {
            completed.checked = true;
        } else {
            const newestDate = this.task.completionDates.last();
            // if (LastKnownDateIsBeforeIntervalReset) {
            //     completed.checked = true;
            // } else {
                completed.checked = false;
            // }
        }
        this.registerDomEvent(completed, 'click', () => {
            completed.checked = true;
            this.task.completionDates.push(new Date());
        });
    }
    
    private DisplayType() {
        const div = this.typeDiv;
        div.empty();
        HTMLHelper.CreateNewTextDiv(div, 'Type');
        const select = div.createEl('select');

        for (let i = 0; i < taskTypes.length; i++) {
            select.createEl('option', { text: taskTypes[i], value: taskTypes[i] } );
        }
        select.value = this.task.type;

        this.timeDiv = div.createDiv('hbox gl-outer-container');

        this.DisplayTimeInfo();

        this.registerDomEvent(select, 'change', () => {
            this.task.type = <TaskType> select.value;
            this.task.startTimes = [];
            this.DisplayTimeInfo();
            this.requestSave();
        });
    }

    private DisplayTimeInfo() {
        const div = this.timeDiv;
        div.empty();
        const type = this.task.type;
        switch(type) {
            case 'daily':
                return this.DailyRepeatEditor();
            case 'one-off':
                return;
            case 'weekly':
                return this.WeeklyRepeatEditor();
            case 'monthly':
                return this.MonthlyRepeatEditor();
            case 'yearly':
                return this.YearlyRepeatEditor();
        }
    }

    private DailyRepeatEditor() {
        const div = this.timeDiv;

        if (this.task.startTimes.length === 0) {
            this.task.startTimes.push(new StartTime());
        }

        HTMLHelper.CreateNewTextDiv(div, 'Days before repeat', 'gl-fit-content');
        const interval = div.createEl('input', { type: 'number', value: this.task.interval + '' } );
        
        const h = div.createEl('input', { type: 'number', value: this.task.startTimes[0].hour + '' } );
        HTMLHelper.CreateNewTextDiv(div, ':', 'gl-fit-content');
        const m = div.createEl('input', { type: 'number', value: this.task.startTimes[0].minute + '' } );
        
        const sel = div.createEl('select');
            sel.createEl('option', { text: 'AM', value: 'AM' } );
            sel.createEl('option', { text: 'PM', value: 'PM' } );
        
        this.registerDomEvent(interval, 'change', () => {
            this.task.interval = parseInt(interval.value);
        });
        this.registerDomEvent(h, 'change', () => {
            const am = sel.value === 'AM';
            this.task.startTimes[0].hour = parseInt(h.value) + (am ? 0 : 12);
        });
        this.registerDomEvent(m, 'change', () => {
            this.task.startTimes[0].minute = parseInt(m.value);
        });
        this.registerDomEvent(sel, 'change', () => {
            const am = sel.value === 'AM';
            this.task.startTimes[0].hour = parseInt(h.value) + (am ? 0 : 12);
        });
    }

    private WeeklyRepeatEditor() {
        const div = this.timeDiv;

        HTMLHelper.CreateNewTextDiv(div, 'Weeks before repeat', 'gl-fit-content');
        const interval = div.createEl('input', { type: 'number', value: this.task.interval + '' } );
        
        const listDiv = div.createDiv();

        HTMLHelper.CreateListEditor(
            listDiv, '', true, this, 
            this.task.startTimes, () => { return new StartTime(); },
            (
                div: HTMLDivElement,
                index: number,
                refreshList: () => Promise<void>
            ) => {
                this.WeekdayEditor(div, index, refreshList);
            }
        );
        this.registerDomEvent(interval, 'change', () => {
            this.task.interval = parseInt(interval.value);
        });
    }

    private WeekdayEditor(
        div: HTMLDivElement,
        index: number,
        refreshList: () => Promise<void>
    ) {
        div.empty();

        const buttonsDiv = div.createDiv('vbox gl-fit-content');
        HTMLHelper.CreateShiftElementUpButton(buttonsDiv, this, this.task.startTimes, index, true, refreshList);
        HTMLHelper.CreateShiftElementDownButton(buttonsDiv, this, this.task.startTimes, index, true, refreshList);
        HTMLHelper.CreateDeleteButton(buttonsDiv, this, this.task.startTimes, index, refreshList);

        const weekday = div.createEl('select');
            weekday.createEl('option', { text: 'Monday', value: '0' } );
            weekday.createEl('option', { text: 'Tuesday', value: '1' } );
            weekday.createEl('option', { text: 'Wednesday', value: '2' } );
            weekday.createEl('option', { text: 'Thursday', value: '3' } );
            weekday.createEl('option', { text: 'Friday', value: '4' } );
            weekday.createEl('option', { text: 'Saturday', value: '5' } );
            weekday.createEl('option', { text: 'Sunday', value: '6' } );
        weekday.value = this.task.startTimes[index].day + '';
        
        const h = div.createEl('input', { type: 'number', value: this.task.startTimes[index].hour + '' } );
        HTMLHelper.CreateNewTextDiv(div, ':', 'gl-fit-content');
        const m = div.createEl('input', { type: 'number', value: this.task.startTimes[index].minute + '' } );
        
        const sel = div.createEl('select');
            sel.createEl('option', { text: 'AM', value: 'AM' } );
            sel.createEl('option', { text: 'PM', value: 'PM' } );

        this.registerDomEvent(weekday, 'change', () => {
            this.task.startTimes[index].day = parseInt(weekday.value);
        });
        this.registerDomEvent(h, 'change', () => {
            const am = sel.value === 'AM';
            this.task.startTimes[index].hour = parseInt(h.value) + (am ? 0 : 12);
        });
        this.registerDomEvent(m, 'change', () => {
            this.task.startTimes[index].minute = parseInt(m.value);
        });
        this.registerDomEvent(sel, 'change', () => {
            const am = sel.value === 'AM';
            this.task.startTimes[index].hour = parseInt(h.value) + (am ? 0 : 12);
        });
    }

    private MonthlyRepeatEditor() {
        const div = this.timeDiv;

        HTMLHelper.CreateNewTextDiv(div, 'Months before repeat', 'gl-fit-content');
        const interval = div.createEl('input', { type: 'number', value: this.task.interval + '' } );
        
        const listDiv = div.createDiv();

        HTMLHelper.CreateListEditor(
            listDiv, '', true, this, 
            this.task.startTimes, () => { return new StartTime(); },
            (
                div: HTMLDivElement,
                index: number,
                refreshList: () => Promise<void>
            ) => {
                this.DayOfMonthEditor(div, index, refreshList);
            }
        );
        this.registerDomEvent(interval, 'change', () => {
            this.task.interval = parseInt(interval.value);
        });
    }

    private DayOfMonthEditor(
        div: HTMLDivElement,
        index: number,
        refreshList: () => Promise<void>
    ) {
        div.empty();

        const buttonsDiv = div.createDiv('vbox gl-fit-content');
        HTMLHelper.CreateShiftElementUpButton(buttonsDiv, this, this.task.startTimes, index, true, refreshList);
        HTMLHelper.CreateShiftElementDownButton(buttonsDiv, this, this.task.startTimes, index, true, refreshList);
        HTMLHelper.CreateDeleteButton(buttonsDiv, this, this.task.startTimes, index, refreshList);

        HTMLHelper.CreateNewTextDiv(div, 'Day of month:', 'gl-fit-content');
        const d = div.createEl('input', { type: 'number', value: this.task.startTimes[index].day + '' } );
        
        const h = div.createEl('input', { type: 'number', value: this.task.startTimes[index].hour + '' } );
        HTMLHelper.CreateNewTextDiv(div, ':', 'gl-fit-content');
        const m = div.createEl('input', { type: 'number', value: this.task.startTimes[index].minute + '' } );
        
        const sel = div.createEl('select');
            sel.createEl('option', { text: 'AM', value: 'AM' } );
            sel.createEl('option', { text: 'PM', value: 'PM' } );

        this.registerDomEvent(d, 'change', () => {
            this.task.startTimes[index].day = parseInt(d.value);
        });
        this.registerDomEvent(h, 'change', () => {
            const am = sel.value === 'AM';
            this.task.startTimes[index].hour = parseInt(h.value) + (am ? 0 : 12);
        });
        this.registerDomEvent(m, 'change', () => {
            this.task.startTimes[index].minute = parseInt(m.value);
        });
        this.registerDomEvent(sel, 'change', () => {
            const am = sel.value === 'AM';
            this.task.startTimes[index].hour = parseInt(h.value) + (am ? 0 : 12);
        });
    }

    private YearlyRepeatEditor() {
        const div = this.timeDiv;

        HTMLHelper.CreateNewTextDiv(div, 'Years before repeat', 'gl-fit-content');
        const interval = div.createEl('input', { type: 'number', value: this.task.interval + '' } );
        
        const listDiv = div.createDiv();

        HTMLHelper.CreateListEditor(
            listDiv, '', true, this, 
            this.task.startTimes, () => { return new StartTime(); },
            (
                div: HTMLDivElement,
                index: number,
                refreshList: () => Promise<void>
            ) => {
                this.MonthOfYearEditor(div, index, refreshList);
            }
        );
        this.registerDomEvent(interval, 'change', () => {
            this.task.interval = parseInt(interval.value);
        });
    }

    private MonthOfYearEditor(
        div: HTMLDivElement,
        index: number,
        refreshList: () => Promise<void>
    ) {
        div.empty();

        const buttonsDiv = div.createDiv('vbox gl-fit-content');
        HTMLHelper.CreateShiftElementUpButton(buttonsDiv, this, this.task.startTimes, index, true, refreshList);
        HTMLHelper.CreateShiftElementDownButton(buttonsDiv, this, this.task.startTimes, index, true, refreshList);
        HTMLHelper.CreateDeleteButton(buttonsDiv, this, this.task.startTimes, index, refreshList);

        HTMLHelper.CreateNewTextDiv(div, 'Month of Year', 'gl-fit-content');
        const mo = div.createEl('input', { type: 'number', value: this.task.startTimes[index].month + '' } );
        HTMLHelper.CreateNewTextDiv(div, 'Day of month');
        const d = div.createEl('input', { type: 'number', value: this.task.startTimes[index].day + '' } );
        const h = div.createEl('input', { type: 'number', value: this.task.startTimes[index].hour + '' } );
        HTMLHelper.CreateNewTextDiv(div, ':', 'gl-fit-content');
        const m = div.createEl('input', { type: 'number', value: this.task.startTimes[index].minute + '' } );
        
        const sel = div.createEl('select');
            sel.createEl('option', { text: 'AM', value: 'AM' } );
            sel.createEl('option', { text: 'PM', value: 'PM' } );

        this.registerDomEvent(mo, 'change', () => {
            this.task.startTimes[index].month = parseInt(mo.value);
        });
        this.registerDomEvent(d, 'change', () => {
            this.task.startTimes[index].day = parseInt(d.value);
        });
        this.registerDomEvent(h, 'change', () => {
            const am = sel.value === 'AM';
            this.task.startTimes[index].hour = parseInt(h.value) + (am ? 0 : 12);
        });
        this.registerDomEvent(m, 'change', () => {
            this.task.startTimes[index].minute = parseInt(m.value);
        });
        this.registerDomEvent(sel, 'change', () => {
            const am = sel.value === 'AM';
            this.task.startTimes[index].hour = parseInt(h.value) + (am ? 0 : 12);
        });
    }

    /**
     * Creates a textarea for the user to edit the description
     * of this observable.
     */
    private DisplayDescription() {
        const div = this.descriptionDiv;
        div.empty();
        HTMLHelper.CreateNewTextDiv(div, 'Description');
        const input = div.createEl('textarea', { text: this.task.description } );
        this.registerDomEvent(input, 'change', () => {
            this.task.description = input.value;
            this.requestSave();
        });
    }
}
