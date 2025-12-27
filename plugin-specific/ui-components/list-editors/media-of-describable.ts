import { ListEditor } from "ui-patterns/list-editor";
import { MediaOfDescribableUIMaker } from "../ui-makers/media-of-describable";
import { Life } from "plugin-specific/models/life";

export class MediaOfDescribableListEditor extends ListEditor<string> {
    constructor(life: Life, parentDiv: HTMLDivElement, mediaKeys: string[], onSave: () => Promise<void>) {
        const uiMaker = new MediaOfDescribableUIMaker(life);
        super(life, parentDiv, mediaKeys, () => { return '' }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}