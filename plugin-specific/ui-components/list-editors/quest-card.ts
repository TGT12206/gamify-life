import { ListEditor } from "ui-patterns/list-editor";
import { Concept } from "plugin-specific/models/concept";
import { QuestCardUIMaker } from "../ui-makers/quest-card";
import { Quest } from "plugin-specific/models/quest";
import { ItemView } from "obsidian";
import { GamifyLifeView } from "../gamify-life-view";
import { QuestService } from "plugin-specific/services/quest";
import { KeyValue } from "plugin-specific/models/key-value";

export class QuestCardListEditor extends ListEditor<KeyValue<Concept>> {
    constructor(parentDiv: HTMLDivElement, concepts: KeyValue<Concept>[], onSave: () => Promise<void>) {
        const uiMaker = new QuestCardUIMaker();
        super(undefined, parentDiv, concepts, () => { return new KeyValue('', new Quest()) }, uiMaker, onSave);
        this.isVertical = true;
        uiMaker.isVertical = false;
        this.enableAddButton = false;
    }
    override async RefreshList(view: GamifyLifeView): Promise<void> {
        this.listDiv.empty();

        const questData = [];
        for (let i = 0; i < this.mainArray.length; i++) {
            if (!this.mainArray[i].value.categoryKeys.contains('Quest')) {
                continue;
            }
            const q = <Quest> view.life.concepts[i].value;
            questData.push({
                index: i,
                isDue: !QuestService.IsCompleted(q),
                lastStart: QuestService.MostRecentStartTime(q)
            });
        }

        questData.sort((a, b) => {
            if (a.isDue !== b.isDue) return a.isDue ? -1 : 1;
            const timeA = a.lastStart?.getTime() ?? 0;
            const timeB = b.lastStart?.getTime() ?? 0;
            return timeB - timeA;
        });

        for (let i = 0; i < questData.length; i++) {
            const data = questData[i];
            const container = this.listDiv.createDiv('gl-quest-item ' + (this.objUIMaker.isVertical ? 'vbox' : 'hbox'));
            if (!data.isDue) container.addClass('gl-quest-complete');
            
            await this.objUIMaker.MakeUI(
                view,
                container,
                this.mainArray,
                data.index,
                this.onSave,
                () => this.RefreshList(view)
            );
        }
    }
}