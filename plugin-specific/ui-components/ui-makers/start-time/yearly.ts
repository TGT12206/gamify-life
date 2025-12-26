import { GamifyLifeView } from "../../gamify-life-view";
import { StartTime } from "plugin-specific/models/quest";
import { StartTimeUIMaker } from "./start-time";

export class YearlyStartTimeUIMaker extends StartTimeUIMaker {
    protected override MakeIntervalSpecificEditors(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: StartTime[],
        index: number
    ): void | Promise<void> {
        this.MakeMonthOfYearEditor(view, div, mainArray[index]);
        this.MakeDayOfMonthEditor(view, div, mainArray[index]);
        this.MakeHourMinuteEditor(view, div, mainArray[index]);
    }
}