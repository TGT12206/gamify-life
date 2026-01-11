import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { Quest } from "plugin-specific/models/quest";
import { MapEntryUI } from "ui-patterns/map-entry-ui";

export class QuestCardUI extends MapEntryUI<string, Concept> {
    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainMap: Map<string, Concept>,
        quest: Quest,
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        div.classList.add('gl-fill');
        div.classList.add('gl-outer-div');
        div.classList.add('gl-bordered');
        if (quest.isCompleted) div.classList.add('gl-quest-complete');
        
        const name = div.createEl('button', { text: quest.GetName(view.life) } );

        this.MakeCompletionCheckbox(view, div.createDiv(), name, quest, onRefresh);

        view.registerDomEvent(name, 'click', () => {
            view.OpenCorrectConceptLoader(quest);
        });
    }
        
    private MakeCompletionCheckbox(
        view: GamifyLifeView,
        div: HTMLDivElement,
        name: HTMLButtonElement,
        quest: Quest,
        onRefresh: () => Promise<void>
    ) {
        const completed = div.createEl('input', { type: 'checkbox' } );
        if (quest.isCompleted) {
            completed.checked = true;
            name.id = 'gl-quest-complete';
        } else if (quest.type === 'One-Off') {
            completed.checked = false;
            name.id = 'gl-quest-incomplete';
        }
        view.registerDomEvent(completed, 'click', async () => {
            const isCompleted = quest.ToggleCompletion();
            name.id = 'gl-quest-' + (isCompleted ? '' : 'in') + 'complete';
            await onRefresh();
        });
    }
}