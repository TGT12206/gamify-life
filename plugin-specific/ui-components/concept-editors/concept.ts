import { HTMLHelper } from "ui-patterns/html-helper";
import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { RelatedClaimGrid } from "../list-editors/related-claim";
import { AliasArrayEditor } from "../list-editors/alias";
import { Life } from "plugin-specific/models/life";
import { CategoryKeyArrayEditor } from "../list-editors/category-key";
import { MediaPathArrayEditor } from "../list-editors/media-path";
import { PageLoader } from "../page";

export class ConceptLoader extends PageLoader {
    constructor(public life: Life) {
        super();
    }

    Load(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept,
        doCheck: boolean = false
    ) {
        div.empty();
        div.className = 'vbox gl-scroll gl-outer-div gl-fill';
        
        if (doCheck && this.CheckIfConceptIsSaved(view, div, concept)) return;

        this.MakeAliasesEditor(view, div.createDiv(), concept);
        this.MakeCategoryEditor(view, div.createDiv(), concept);
        this.MakeMediaListEditor(view, div.createDiv(), concept);
        this.MakeDescriptionEditor(view, div.createDiv(), concept);
        this.MakeObservationListDisplay(view, div.createDiv(), concept);
    }

    CheckIfConceptIsSaved(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        const concepts = [...view.life.concepts.values()];
        if (!concepts.contains(concept)) {
            HTMLHelper.CreateNewTextDiv(div, 'This concept has been deleted.');
            return true;
        }
        return false;
    }

    protected MakeAliasesEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Aliases:');
        new AliasArrayEditor(div.createDiv(), concept.aliases, view);
    }

    protected MakeCategoryEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Categories:');
        new CategoryKeyArrayEditor(concept, div.createDiv(), view);
    }
    
    MakeMediaListEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Media:');
        new MediaPathArrayEditor(div.createDiv(), concept.mediaPaths, view);
    }

    MakeDescriptionEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.empty();
        div.addClass('vbox');
        div.addClass('gl-outer-div');

        HTMLHelper.CreateNewTextDiv(div, 'Description');

        const input = div.createEl('textarea', {
            text: concept.description
        });
        input.className = 'gl-fill';

        view.registerDomEvent(input, 'change', async () => {
            concept.description = input.value;
            await view.onSave();
        });
    }

    protected MakeObservationListDisplay(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.className = 'vbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Observations:');
        new RelatedClaimGrid(concept, div.createDiv(), view);
    }
}