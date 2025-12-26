import { ListEditor } from "ui-patterns/list-editor";
import { Evidence } from "plugin-specific/models/observation";
import { EvidenceUIMaker } from "../ui-makers/evidence";
import { Concept } from "plugin-specific/models/concept";

export class EvidenceListEditor extends ListEditor<Evidence> {
    constructor(root: Concept | undefined, parentDiv: HTMLDivElement, evidenceList: Evidence[], onSave: () => Promise<void>) {
        const uiMaker = new EvidenceUIMaker();
        super(root, parentDiv, evidenceList, () => { return new Evidence() }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}