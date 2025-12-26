import { ListEditor } from "ui-patterns/list-editor";
import { StartTime } from "plugin-specific/models/quest";
import { DailyStartTimeUIMaker } from "plugin-specific/ui-components/ui-makers/start-time/daily";

export class DailyStartTimeListEditor extends ListEditor<StartTime> {
    constructor(parentDiv: HTMLDivElement, startTimes: StartTime[], onSave: () => Promise<void>) {
        const uiMaker = new DailyStartTimeUIMaker();
        super(undefined, parentDiv, startTimes, () => { return new StartTime() }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}