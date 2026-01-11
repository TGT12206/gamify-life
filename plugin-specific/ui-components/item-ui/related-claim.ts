import { Concept } from "plugin-specific/models/concept";
import { GamifyLifeView } from "../gamify-life-view";
import { MapEntryUI } from "ui-patterns/map-entry-ui";
import { Claim } from "plugin-specific/models/claim";

export class RelatedClaimCardUI extends MapEntryUI<string, Concept> {
    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainMap: Map<string, Concept>,
        itemAccess: Concept,
        onRefresh: (() => Promise<void>) | null,
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        const obs = <Claim> itemAccess;
        const button = div.createEl('button', { text: obs.description } );
        button.className = 'gl-bordered gl-grid-card gl-progress';
        button.style.setProperty('--progress', obs.confidenceLevel + '%');

        view.registerDomEvent(button, 'click', () => {
            view.OpenCorrectConceptLoader(obs);
        });
    }
}