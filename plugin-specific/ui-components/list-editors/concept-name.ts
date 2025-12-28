import { ListEditor } from "ui-patterns/list-editor";
import { ConceptNameUIMaker } from "../ui-makers/concept-name";
import { Concept } from "plugin-specific/models/concept";

export class ConceptNameListEditor extends ListEditor<string> {
    constructor(root: Concept | undefined, parentDiv: HTMLDivElement, conceptNames: string[], onSave: () => Promise<void>) {
        const uiMaker = new ConceptNameUIMaker();
        super(root, parentDiv, conceptNames, () => { return '' }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}