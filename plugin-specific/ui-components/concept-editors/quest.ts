import { Quest } from "plugin-specific/models/quest";
import { GamifyLifeView } from "../gamify-life-view";
import { ConceptLoader } from "./concept";
import { HTMLHelper } from "ui-patterns/html-helper";
import { QuestType, questTypes } from "plugin-specific/models/const";
import { StartTimeArrayEditor } from "../list-editors/start-time";

export class QuestLoader extends ConceptLoader {
    override Load(view: GamifyLifeView, div: HTMLDivElement, quest: Quest, doCheck: boolean = false) {
        super.Load(view, div, quest, doCheck);
        this.MakeTypeEditor(view, div.createDiv(), quest);
        this.MakeInitialDateEditor(view, div.createDiv(), quest);
    }
    
    MakeCompletionCheckbox(view: GamifyLifeView, div: HTMLDivElement, quest: Quest) {
        const completed = div.createEl('input', { type: 'checkbox' } );
        if (quest.isCompleted) {
            completed.checked = true;
        } else if (quest.type === 'One-Off') {
            completed.checked = false;
        }
        view.registerDomEvent(completed, 'click', async () => {
            quest.ToggleCompletion();
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
        let intervalText = ' before repeat';
        switch(quest.type) {
            case 'Yearly':
                intervalText = 'Years' + intervalText;
                break;
            case 'Monthly':
                intervalText = 'Months' + intervalText;
                break;
            case 'Weekly':
                intervalText = 'Weeks' + intervalText;
                break;
            case 'Daily':
                intervalText = 'Days' + intervalText;
                break;
            case 'One-Off':
                return;
        }

        HTMLHelper.CreateNewTextDiv(div, intervalText);
        const interval = div.createEl('input', { type: 'number', value: quest.interval + '' } );
        
        HTMLHelper.CreateNewTextDiv(div, 'Repeat on:');
        new StartTimeArrayEditor(quest, div.createDiv(), view);

        view.registerDomEvent(interval, 'change', async () => {
            quest.interval = parseInt(interval.value);
            await view.onSave();
        });
    }
    
    protected MakeInitialDateEditor(view: GamifyLifeView, div: HTMLDivElement, quest: Quest) {
        div.className = 'vbox gl-outer-div';

        HTMLHelper.CreateNewTextDiv(div, 'Initial Start Date');
        const startDate = div.createEl('input', { type: 'datetime-local', value: HTMLHelper.DateToDateTimeLocalString(quest.initialDate) } );
        view.registerDomEvent(startDate, 'change', async () => {
            quest.initialDate = new Date(startDate.value);
            await view.onSave();
        });
    }
}