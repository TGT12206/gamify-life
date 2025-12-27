import { ListEditor } from "ui-patterns/list-editor";
import { AliasUIMaker } from "../ui-makers/alias";

export class AliasListEditor extends ListEditor<string> {
    constructor(parentDiv: HTMLDivElement, aliases: string[], onSave: () => Promise<void>) {
        const uiMaker = new AliasUIMaker();
        super(undefined, parentDiv, aliases, () => { return '' }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}