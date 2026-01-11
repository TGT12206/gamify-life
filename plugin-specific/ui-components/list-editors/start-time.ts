import { Quest, StartTime } from "plugin-specific/models/quest";
import { GamifyLifeView } from "plugin-specific/ui-components/gamify-life-view";
import { ArrayEditor } from "ui-patterns/array-editor";
import { StartTimeUI } from "../item-ui/start-time";

export class StartTimeArrayEditor extends ArrayEditor<StartTime> {
    constructor(quest: Quest, div: HTMLDivElement, view: GamifyLifeView) {
        const itemUI = new StartTimeUI(quest);
        super(div, quest.startTimes, itemUI);
        
        this.globalData = quest;

        this.makeNewItem = () => new StartTime();
        this.onSave = view.onSave;

        this.simpleDisplayOrder = (a, b) => {
            if (a.month !== b.month) return a.month - b.month;
            if (a.day !== b.day) return a.day - b.day;
            if (a.hour !== b.hour) return a.hour - b.hour;
            if (a.minute !== b.minute) return a.minute - b.minute;
            return 0;
        };
        
        this.isVertical = false;
        this.itemsPerLine = 1;
        this.enableAddButton = true;
        this.indexedBased = false;

        itemUI.isVertical = true;

        this.Render(view);
    }
}