import { Concept } from "plugin-specific/models/concept";
import { Life } from "plugin-specific/models/life";
import { RelatedObservationCardUIMaker } from "../ui-makers/related-observation";
import { Observation } from "plugin-specific/models/observation";
import { GamifyLifeView } from "../gamify-life-view";
import { Notice, setIcon } from "obsidian";
import { ConceptService } from "plugin-specific/services/concept";
import { GridEditor } from "ui-patterns/grid-editor";

export class RelatedObservationGridEditor extends GridEditor<Concept> {
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
    }

    override async RefreshList(view: GamifyLifeView): Promise<void> {
        const scrollTop = this.listDiv.scrollTop;
        this.listDiv.empty();
        if (this.isVertical) {
            this.listDiv.style.gridTemplateColumns = 'repeat(' + this.itemsPerLine + ', 1fr)';
        } else {
            this.listDiv.style.gridTemplateRows = 'repeat(' + this.itemsPerLine + ', 1fr)';
        }
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
        this.listDiv.scrollTop = scrollTop;
    }

    protected override CreateAddButton(view: GamifyLifeView): void {
        const anchor = this.parentDiv.createDiv('gl-pos-anchor');
        const addButton = anchor.createEl('button');
        setIcon(addButton, 'plus');
        addButton.id = 'gl-grid-add-button';

        view.registerDomEvent(addButton, 'click', async () => {
            const targetName = this.targetConcept.name;
            let count = 1;

            for (let i = 0; i < view.life.concepts.length; i++) {
                const concept = view.life.concepts[i];
                
                if (concept.categoryKeys.contains('Observation')) {
                    const obs = <Observation> concept;
                    if (obs.conceptNames.contains(targetName)) {
                        count++;
                    }
                }
            }

            const newObservation = <Observation> await this.newObjMaker();
            const on = count % 10; count = Math.floor(count / 10);
            const te = count % 10; count = Math.floor(count / 10);
            const hu = count % 10; count = Math.floor(count / 10);
            const th = count % 10; count = Math.floor(count / 10);

            const obsName = targetName + ': ' + th + '' + hu + '' + te + '' + on;

            newObservation.name = obsName;
            newObservation.conceptNames.push(targetName);
            const nameIsTaken = ConceptService.CheckIfNameIsTaken(view.life, newObservation.name);

            if (nameIsTaken) {
                new Notice('Automatically generated name (' + obsName + ') was taken. Please create it manually.');
                return;
            }

            ConceptService.InsertConcept(view.life.concepts, newObservation);
            await this.onSave();
            await this.RefreshList(view);
        });        
    }
}