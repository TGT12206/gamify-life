import { Quest } from "plugin-specific/models/quest";
import { GamifyLifeView } from "../gamify-life-view";
import { ConceptEditorUIMaker } from "./concept";
import { HTMLHelper } from "ui-patterns/html-helper";
import { QuestType, questTypes } from "plugin-specific/models/const";
import { DailyStartTimeListEditor } from "../list-editors/start-time/daily";
import { YearlyStartTimeListEditor } from "../list-editors/start-time/yearly";
import { MonthlyStartTimeListEditor } from "../list-editors/start-time/monthly";
import { WeeklyStartTimeListEditor } from "../list-editors/start-time/weekly";
import { QuestService } from "plugin-specific/services/quest";

export class QuestEditorUIMaker extends ConceptEditorUIMaker {
    override MakeUI(view: GamifyLifeView, div: HTMLDivElement, quest: Quest) {
        super.MakeUI(view, div, quest);
        this.MakeTypeEditor(view, div.createDiv(), quest);
    }
    
    MakeCompletionCheckbox(view: GamifyLifeView, div: HTMLDivElement, quest: Quest) {
        const completed = div.createEl('input', { type: 'checkbox' } );
        if (QuestService.IsCompleted(quest)) {
            completed.checked = true;
        } else if (quest.type === 'one-off') {
            completed.checked = false;
        }
        view.registerDomEvent(completed, 'click', async () => {
            QuestService.ToggleCompletion(quest);
            await view.onSave();
        });
    }

    protected MakeTypeEditor(view: GamifyLifeView, div: HTMLDivElement, quest: Quest) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Type');
        const select = div.createEl('select');

        for (let i = 0; i < questTypes.length; i++) {
            select.createEl('option', { text: questTypes[i], value: questTypes[i] } );
        }
        select.value = quest.type;

        const timeDiv = div.createDiv('hbox gl-outer-div');

        this.DisplayTimeInfo(view, timeDiv, quest);

        view.registerDomEvent(select, 'change', async () => {
            quest.type = <QuestType> select.value;
            quest.startTimes = [];
            this.DisplayTimeInfo(view, timeDiv, quest);
            await view.onSave();
        });
    }

    private DisplayTimeInfo(view: GamifyLifeView, div: HTMLDivElement, quest: Quest) {
        div.empty();
        const type = quest.type;
        switch(type) {
            case 'daily':
                return this.DailyRepeatEditor(view, div, quest);
            case 'one-off':
                return;
            case 'weekly':
                return this.WeeklyRepeatEditor(view, div, quest);
            case 'monthly':
                return this.MonthlyRepeatEditor(view, div, quest);
            case 'yearly':
                return this.YearlyRepeatEditor(view, div, quest);
        }
    }

    private DailyRepeatEditor(view: GamifyLifeView, div: HTMLDivElement, quest: Quest) {
        div.empty();

        HTMLHelper.CreateNewTextDiv(div, 'Days before repeat');
        const interval = div.createEl('input', { type: 'number', value: quest.interval + '' } );

        HTMLHelper.CreateNewTextDiv(div, 'Repeat on:');
        const listEditor = new DailyStartTimeListEditor(div.createDiv(), quest.startTimes, view.onSave);
        listEditor.Render(view);

        view.registerDomEvent(interval, 'change', async () => {
            quest.interval = parseInt(interval.value);
            await view.onSave();
        });
    }

    private WeeklyRepeatEditor(view: GamifyLifeView, div: HTMLDivElement, quest: Quest) {
        div.empty();

        HTMLHelper.CreateNewTextDiv(div, 'Weeks before repeat');
        const interval = div.createEl('input', { type: 'number', value: quest.interval + '' } );
        
        HTMLHelper.CreateNewTextDiv(div, 'Repeat on:');
        const listEditor = new WeeklyStartTimeListEditor(div.createDiv(), quest.startTimes, view.onSave);
        listEditor.Render(view);

        view.registerDomEvent(interval, 'change', async () => {
            quest.interval = parseInt(interval.value);
            await view.onSave();
        });
    }

    private MonthlyRepeatEditor(view: GamifyLifeView, div: HTMLDivElement, quest: Quest) {
        div.empty();

        HTMLHelper.CreateNewTextDiv(div, 'Months before repeat');
        const interval = div.createEl('input', { type: 'number', value: quest.interval + '' } );
        
        HTMLHelper.CreateNewTextDiv(div, 'Repeat on:');
        const listEditor = new MonthlyStartTimeListEditor(div.createDiv(), quest.startTimes, view.onSave);
        listEditor.Render(view);

        view.registerDomEvent(interval, 'change', async () => {
            quest.interval = parseInt(interval.value);
            await view.onSave();
        });
    }

    private YearlyRepeatEditor(view: GamifyLifeView, div: HTMLDivElement, quest: Quest) {
        div.empty();

        HTMLHelper.CreateNewTextDiv(div, 'Years before repeat');
        const interval = div.createEl('input', { type: 'number', value: quest.interval + '' } );
        
        HTMLHelper.CreateNewTextDiv(div, 'Repeat on:');
        const listEditor = new YearlyStartTimeListEditor(div.createDiv(), quest.startTimes, view.onSave);
        listEditor.Render(view);

        view.registerDomEvent(interval, 'change', async () => {
            quest.interval = parseInt(interval.value);
            await view.onSave();
        });
    }
}