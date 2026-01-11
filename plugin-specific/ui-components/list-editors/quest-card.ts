import { Concept } from "plugin-specific/models/concept";
import { Quest } from "plugin-specific/models/quest";
import { GamifyLifeView } from "../gamify-life-view";
import { GenerateUniqueStringKey, MapEditor, MapEntry } from "ui-patterns/map-editor";
import { QuestCardUI } from "../item-ui/quest-card";

export class QuestCardList extends MapEditor<string, Concept> {
    constructor(div: HTMLDivElement, view: GamifyLifeView) {
        const itemUI = new QuestCardUI();
        super(div, view.life.concepts, itemUI);

        this.makeNewEntry = () => {
            const key = GenerateUniqueStringKey();
            const value = new Quest()
            return new MapEntry(key, value)
        };
        this.onSave = view.onSave;
        
        this.simpleDisplayFilter = entry => entry.value.baseCategory === 'Quest';
        this.simpleDisplayOrder = (a: MapEntry<string, Quest>, b: MapEntry<string, Quest>) => { 
            const q1 = <Quest> a.value; const q2 = <Quest> b.value;
            const aDue = !q1.isCompleted; const bDue = !q2.isCompleted;

            if (aDue !== bDue) return aDue ? -1 : 1;
            const timeA = q1.mostRecentStartTime?.getTime() ?? 0;
            const timeB = q2.mostRecentStartTime?.getTime() ?? 0;
            return timeB - timeA;
        };
        
        this.isVertical = true;
        this.itemsPerLine = 1;
        this.enableAddButton = true;
        this.keyBased = false;

        itemUI.isVertical = true;

        this.Render(view);
    }
}