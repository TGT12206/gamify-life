import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { Moment } from "plugin-specific/models/moment";
import { MapEntryUI } from "ui-patterns/map-entry-ui";

export class MomentCardUI extends MapEntryUI<string, Concept> {
    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainMap: Map<string, Concept>,
        moment: Moment,
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        div.classList.add('gl-fill');
        div.classList.add('gl-outer-div');
        div.classList.add('gl-bordered');
        
        const nameButton = div.createEl('button', { text: moment.startTime.toDateString() } );

        view.registerDomEvent(nameButton, 'click', () => {
            view.OpenCorrectConceptLoader(moment);
        });
    }
}