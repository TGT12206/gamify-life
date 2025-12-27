import { ListEditor } from "ui-patterns/list-editor";
import { RankUIMaker } from "../ui-makers/rank";

export class RankListEditor extends ListEditor<string> {
    constructor(parentDiv: HTMLDivElement, ranks: string[], onSave: () => Promise<void>) {
        const uiMaker = new RankUIMaker();
        super(undefined, parentDiv, ranks, () => { return '' }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}