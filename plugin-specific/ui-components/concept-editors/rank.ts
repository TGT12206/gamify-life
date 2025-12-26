import { Concept } from "plugin-specific/models/concept";
import { GamifyLifeView } from "../gamify-life-view";
import { ConceptEditorUIMaker } from "./concept";
import { Rank } from "plugin-specific/models/skill";
import { HTMLHelper } from "ui-patterns/html-helper";

export class RankEditorUIMaker extends ConceptEditorUIMaker {
    override MakeUI(view: GamifyLifeView, div: HTMLDivElement, concept: Concept) {
        super.MakeUI(view, div, concept);
        this.MakeThresholdEditor(view, div.createDiv(), <Rank> concept);
    }

    protected MakeThresholdEditor(view: GamifyLifeView, div: HTMLDivElement, rank: Rank) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Threshold for this rank:');
        const input = div.createEl('input', { type: 'number', value: rank.threshold + '' } );
        view.registerDomEvent(input, 'change', async () => {
            rank.threshold = parseFloat(input.value);
            await view.onSave();
        });
    }
}