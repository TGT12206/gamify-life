import { GamifyLifeView } from "../gamify-life-view";
import { ConceptEditorUIMaker } from "./concept";
import { Observation } from "plugin-specific/models/observation";
import { ConceptNameListEditor } from "../list-editors/concept-name";
import { HTMLHelper } from "ui-patterns/html-helper";
import { EvidenceListEditor } from "../list-editors/evidence";

export class ObservationEditorUIMaker extends ConceptEditorUIMaker {
    override MakeUI(view: GamifyLifeView, div: HTMLDivElement, observation: Observation) {
        super.MakeUI(view, div, observation);
        this.MakeConceptKeysEditor(view, div.createDiv(), observation);
        this.MakeEvidenceListEditor(view, div.createDiv(), observation);
    }

    protected MakeConceptKeysEditor(view: GamifyLifeView, div: HTMLDivElement, observation: Observation) {
        div.className = 'hbox';
        HTMLHelper.CreateNewTextDiv(div, 'Concepts involved:');
        const listEditor = new ConceptNameListEditor(observation, div.createDiv(), observation.conceptNames, view.onSave);
        listEditor.Render(view);
    }

    protected MakeEvidenceListEditor(view: GamifyLifeView, div: HTMLDivElement, observation: Observation) {
        div.className = 'hbox';
        HTMLHelper.CreateNewTextDiv(div, 'Evidence:');
        const listEditor = new EvidenceListEditor(observation, div.createDiv(), observation.evidenceList, view.onSave);
        listEditor.Render(view);
    }
}