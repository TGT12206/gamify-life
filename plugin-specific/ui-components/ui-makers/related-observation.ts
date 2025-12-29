import { Concept } from "plugin-specific/models/concept";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { Observation } from "plugin-specific/models/observation";

export class RelatedObservationCardUIMaker extends ObjUIMaker<Concept> {
    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: Concept[],
        index: number
    ): Promise<void> {
        const obs = <Observation> mainArray[index];
        const button = itemDiv.createEl('button', { text: obs.description } );
        button.className = 'gl-bordered gl-grid-card gl-progress';
        button.style.setProperty('--progress', (<Observation> mainArray[index]).confidenceLevel + '%')

        view.registerDomEvent(button, 'click', () => {
            view.OpenCorrectConceptEditor(obs);
        });
    }
}