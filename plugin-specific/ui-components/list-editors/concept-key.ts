import { ListEditor } from "ui-patterns/list-editor";
import { ConceptKeyUIMaker } from "../ui-makers/concept-key";
import { Concept } from "plugin-specific/models/concept";

export class ConceptKeyListEditor extends ListEditor<string> {
    constructor(root: Concept | undefined, parentDiv: HTMLDivElement, conceptKeys: string[], onSave: () => Promise<void>) {
        const uiMaker = new ConceptKeyUIMaker();
        super(root, parentDiv, conceptKeys, () => { return '' }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}