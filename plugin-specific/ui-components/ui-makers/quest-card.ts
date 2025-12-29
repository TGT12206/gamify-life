import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { Quest } from "plugin-specific/models/quest";
import { QuestService } from "plugin-specific/services/quest";

export class QuestCardUIMaker extends ObjUIMaker<Concept> {
    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: Concept[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        itemDiv.classList.add('gl-fill');
        itemDiv.classList.add('gl-outer-div');
        itemDiv.classList.add('gl-bordered');
        
        const name = itemDiv.createEl('button', { text: mainArray[index].name } );

        this.MakeCompletionCheckbox(view, itemDiv.createDiv(), name, <Quest> mainArray[index], onRefresh);

        view.registerDomEvent(name, 'click', () => {
            view.OpenCorrectConceptEditor(mainArray[index]);
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
        if (QuestService.IsCompleted(quest)) {
            completed.checked = true;
            name.id = 'gl-quest-complete';
        } else if (quest.type === 'one-off') {
            completed.checked = false;
            name.id = 'gl-quest-incomplete';
        }
        view.registerDomEvent(completed, 'click', async () => {
            const isCompleted = QuestService.ToggleCompletion(quest);
            name.id = 'gl-quest-' + (isCompleted ? '' : 'in') + 'complete';
            await onRefresh();
        });
    }
}