import { Concept } from "plugin-specific/models/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { Observation } from "plugin-specific/models/observation";
import { HTMLHelper } from "ui-patterns/html-helper";

export class RelatedObservationCardUIMaker extends ObjUIMaker<KeyValue<Concept>> {
    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: KeyValue<Concept>[],
        index: number
    ): Promise<void> {
        const obs = <Observation> mainArray[index].value;
        const button = itemDiv.createEl('button', { text: obs.description } );
        button.className = 'gl-bordered gl-fill';

        view.registerDomEvent(button, 'click', () => {
            view.OpenCorrectConceptEditor(obs);
        });
    }
}