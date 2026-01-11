import { Concept } from "plugin-specific/models/concept";
import { MapEntryUI } from "ui-patterns/map-entry-ui";
import { GamifyLifeView } from "../gamify-life-view";
import { setIcon } from "obsidian";
import { HTMLHelper } from "ui-patterns/html-helper";
import { SearchContext } from "../list-editors/search-card";

export class SearchCardUI extends MapEntryUI<string, Concept> {
    get context(): SearchContext {
        return <SearchContext> this.globalData;
    }
    set context(newContext: SearchContext) {
        this.globalData = newContext;
    }
    constructor(context: SearchContext) {
        super();
        this.context = context;
    }

    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainMap: Map<string, Concept>,
        itemAccess: { key: string },
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        div.classList.add('gl-fill');
        div.classList.add('gl-outer-div');
        div.classList.add('gl-bordered');
        const buttonDiv = div.createDiv('hbox gl-pos-anchor');

        const key = itemAccess.key;
        const concept = <Concept> view.life.concepts.get(key);

        this.MakeEditButton(view, buttonDiv.createDiv('gl-floating-edit-button'), concept);
        HTMLHelper.CreateNewTextDiv(div, concept.GetName(view.life) ?? key);
        if (this.context.showImages && concept.mediaPaths.length > 0) {
            const mediaDiv = div.createDiv('hbox');
            view.mediaRenderer.renderMedia(mediaDiv, view, concept.mediaPaths[0]);
        }

        const onDelete = async () => {
            view.life.DeleteConcept(key);
            await onRefresh();
        }

        const floatingDiv = buttonDiv.createDiv('gl-floating-remove-button');

        this.MakeDeleteButton(view, floatingDiv, mainMap, concept, onDelete);
    }

    private MakeEditButton(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        const editButton = div.createEl('button', { cls: 'gl-fit-content' } );
        setIcon(editButton, 'pencil-line');
        view.registerDomEvent(editButton, 'click', () => {
            view.OpenCorrectConceptLoader(concept);
        });
    }
}