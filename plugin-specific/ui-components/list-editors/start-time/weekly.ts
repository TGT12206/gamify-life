import { ListEditor } from "ui-patterns/list-editor";
import { StartTime } from "plugin-specific/models/quest";
import { WeeklyStartTimeUIMaker } from "plugin-specific/ui-components/ui-makers/start-time/weekly";

export class WeeklyStartTimeListEditor extends ListEditor<StartTime> {
    constructor(parentDiv: HTMLDivElement, startTimes: StartTime[], onSave: () => Promise<void>) {
        const uiMaker = new WeeklyStartTimeUIMaker();
        super(undefined, parentDiv, startTimes, () => { return new StartTime() }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}