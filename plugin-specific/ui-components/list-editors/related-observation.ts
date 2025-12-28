import { Concept } from "plugin-specific/models/concept";
import { Life } from "plugin-specific/models/life";
import { RelatedObservationCardUIMaker } from "../ui-makers/related-observation";
import { Observation } from "plugin-specific/models/observation";
import { GamifyLifeView } from "../gamify-life-view";
import { ListEditor } from "ui-patterns/list-editor";

export class RelatedObservationGridEditor extends ListEditor<Concept> {
    private targetConcept: Concept;

    constructor(
        parentDiv: HTMLDivElement,
        life: Life,
        targetConcept: Concept,
        onSave: () => Promise<void>
    ) {
        const uiMaker = new RelatedObservationCardUIMaker();
        const newObjMaker = () => new Observation();
        
        super(undefined, parentDiv, life.concepts, newObjMaker, uiMaker, onSave);
        
        this.targetConcept = targetConcept;
        this.isVertical = true;
        uiMaker.isVertical = true;
        this.enableAddButton = false;
    }

    override async RefreshList(view: GamifyLifeView): Promise<void> {
        this.listDiv.empty();
        
        let relatedIndices: number[] = [];
        
        const targetName = this.targetConcept.name;

        for (let i = 0; i < view.life.concepts.length; i++) {
            const concept = view.life.concepts[i];
            
            if (concept.categoryKeys.contains('Observation')) {
                const obs = <Observation> concept;
                if (obs.conceptNames.contains(targetName)) {
                    relatedIndices.push(i);
                }
            }
        }

        for (let i = 0; i < relatedIndices.length; i++) {
            const itemContainer = this.listDiv.createDiv('gl-outer-div vbox');
            await this.objUIMaker.MakeUI(
                view,
                itemContainer,
                this.mainArray,
                relatedIndices[i],
                this.onSave,
                async () => {
                    await this.onSave();
                    await this.RefreshList(view);
                }
            );
        }

        if (relatedIndices.length === 0) {
            this.listDiv.createEl('i', { text: 'No related observations found.' });
        }
    }
}