import { ListEditor } from "ui-patterns/list-editor";
import { StartTime } from "plugin-specific/models/quest";
import { MonthlyStartTimeUIMaker } from "plugin-specific/ui-components/ui-makers/start-time/monthly";

export class MonthlyStartTimeListEditor extends ListEditor<StartTime> {
    constructor(parentDiv: HTMLDivElement, startTimes: StartTime[], onSave: () => Promise<void>) {
        const uiMaker = new MonthlyStartTimeUIMaker();
        super(undefined, parentDiv, startTimes, () => { return new StartTime() }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}