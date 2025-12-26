import { Concept } from "plugin-specific/models/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { Life } from "plugin-specific/models/life";
import { RelatedObservationCardUIMaker } from "../ui-makers/related-observation";
import { Observation } from "plugin-specific/models/observation";
import { GamifyLifeView } from "../gamify-life-view";
import { ListEditor } from "ui-patterns/list-editor";
import { KeyService } from "plugin-specific/services/key";

export class RelatedObservationGridEditor extends ListEditor<KeyValue<Concept>> {
    private targetConcept: Concept;

    constructor(
        parentDiv: HTMLDivElement,
        life: Life,
        targetConcept: Concept,
        onSave: () => Promise<void>
    ) {
        const uiMaker = new RelatedObservationCardUIMaker();
        const dummyMaker = () => new KeyValue('', new Observation());
        
        super(undefined, parentDiv, life.concepts, dummyMaker, uiMaker, onSave);
        
        this.targetConcept = targetConcept;
        this.isVertical = true;
        uiMaker.isVertical = true;
        this.enableAddButton = false;
    }

    override async RefreshList(view: GamifyLifeView): Promise<void> {
        this.listDiv.empty();
        
        let relatedIndices: number[] = [];

        const index = KeyService.FindValue(view.life.concepts, this.targetConcept);

        if (index === -1) {
            return;
        }

        const targetKey = view.life.concepts[index].key

        for (let i = 0; i < view.life.concepts.length; i++) {
            const concept = view.life.concepts[i].value;
            
            if (concept.categoryKeys.contains('Observation')) {
                const obs = <Observation> concept;
                if (obs.conceptKeys.contains(targetKey)) {
                    relatedIndices.push(i);
                }
            }
        }

        for (const index of relatedIndices) {
            const itemContainer = this.listDiv.createDiv('gl-outer-div vbox');
            await this.objUIMaker.MakeUI(
                view,
                itemContainer,
                this.mainArray,
                index,
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