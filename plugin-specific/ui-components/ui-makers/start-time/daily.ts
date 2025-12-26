import { GamifyLifeView } from "../../gamify-life-view";
import { StartTime } from "plugin-specific/models/quest";
import { StartTimeUIMaker } from "./start-time";

export class DailyStartTimeUIMaker extends StartTimeUIMaker {
    protected override MakeIntervalSpecificEditors(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: StartTime[],
        index: number
    ): void | Promise<void> {
        this.MakeHourMinuteEditor(view, div, mainArray[index]);
    }
}