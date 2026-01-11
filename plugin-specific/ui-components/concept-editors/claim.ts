import { GamifyLifeView } from "../gamify-life-view";
import { ConceptLoader } from "./concept";
import { Claim } from "plugin-specific/models/claim";
import { ConceptKeyArrayEditor } from "../list-editors/concept-key";
import { HTMLHelper } from "ui-patterns/html-helper";
import { EvidenceArrayEditor } from "../list-editors/evidence";

export class ClaimLoader extends ConceptLoader {
    override Load(view: GamifyLifeView, div: HTMLDivElement, claim: Claim, doCheck: boolean = false) {
        div.empty();
        div.className = 'vbox gl-scroll gl-outer-div gl-fill';
        if (doCheck && this.CheckIfConceptIsSaved(view, div, claim)) return;
        this.MakeAliasesEditor(view, div.createDiv(), claim);
        this.MakeCategoryEditor(view, div.createDiv(), claim);
        this.MakeMediaListEditor(view, div.createDiv(), claim);
        this.MakeDescriptionEditor(view, div.createDiv(), claim);
        this.MakeObservationListDisplay(view, div.createDiv(), claim);
        this.MakeConceptKeysEditor(view, div.createDiv(), claim);
        this.MakeConfidenceEditor(view, div.createDiv(), claim);
        this.MakeEvidenceListEditor(view, div.createDiv(), claim);
    }

    MakeConfidenceEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        claim: Claim
    ) {
        div.empty();
        div.addClass('hbox');
        div.addClass('gl-outer-div');

        HTMLHelper.CreateNewTextDiv(div, 'Level of confidence');

        const input = div.createEl('input', {
            type: 'number',
            value: claim.confidenceLevel + ''
        });
        HTMLHelper.CreateNewTextDiv(div, '%');

        view.registerDomEvent(input, 'change', async () => {
            const newValue = parseFloat(input.value);
            claim.confidenceLevel = newValue;
            await view.onSave();
        })
    }

    MakeConceptKeysEditor(view: GamifyLifeView, div: HTMLDivElement, claim: Claim) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Concepts involved:');
        new ConceptKeyArrayEditor(claim, div.createDiv(), view);
    }

    MakeEvidenceListEditor(view: GamifyLifeView, div: HTMLDivElement, claim: Claim) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Evidence:');
        new EvidenceArrayEditor(claim, div.createDiv(), claim.evidenceList, view);
    }
}