import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { ConceptKeySuggest } from "../suggest/concept-key-suggest";
import { Concept } from "plugin-specific/models/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { ConceptService } from "plugin-specific/services/concept";
import { Quest } from "plugin-specific/models/quest";
import { QuestService } from "plugin-specific/services/quest";

export class QuestCardUIMaker extends ObjUIMaker<KeyValue<Concept>> {
    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: KeyValue<Concept>[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        itemDiv.classList.add('gl-bordered');
        
        const name = itemDiv.createEl('button', { text: ConceptService.GetNameFromKey(view.life, mainArray[index].key) } );

        this.MakeCompletionCheckbox(view, itemDiv.createDiv(), <Quest> mainArray[index].value, onRefresh);

        view.registerDomEvent(name, 'click', () => {
            view.OpenCorrectConceptEditor(mainArray[index].value);
        });
    }
        
    private MakeCompletionCheckbox(
        view: GamifyLifeView,
        div: HTMLDivElement,
        quest: Quest,
        onRefresh: () => Promise<void>
    ) {
        const completed = div.createEl('input', { type: 'checkbox' } );
        if (QuestService.IsCompleted(quest)) {
            completed.checked = true;
        } else if (quest.type === 'one-off') {
            completed.checked = false;
        }
        view.registerDomEvent(completed, 'click', async () => {
            QuestService.ToggleCompletion(quest);
            await onRefresh();
        });
    }
}