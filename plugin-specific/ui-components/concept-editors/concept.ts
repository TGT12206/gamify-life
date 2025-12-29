import { HTMLHelper } from "ui-patterns/html-helper";
import { DescribableEditorUIMaker } from "./describable";
import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { RelatedObservationGridEditor } from "../list-editors/related-observation";
import { CategoryListEditor } from "../list-editors/category";
import { AliasListEditor } from "../list-editors/alias";
import { ConceptService } from "plugin-specific/services/concept";
import { Notice } from "obsidian";

export class ConceptEditorUIMaker extends DescribableEditorUIMaker {
    MakeUI(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.empty();
        div.className = 'vbox gl-scroll gl-outer-div gl-fill';
        this.MakeNameEditor(view, div.createDiv(), concept);
        this.MakeAliasesEditor(view, div.createDiv(), concept);
        this.MakeCategoryEditor(view, div.createDiv(), concept);
        this.MakeMediaListEditor(view, div.createDiv(), concept);
        this.MakeDescriptionEditor(view, div.createDiv(), concept);
        this.MakeObservationListDisplay(view, div.createDiv(), concept);
    }

    protected MakeNameEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.empty();
        div.addClass('vbox'); 

        if (concept.name === 'Self') {
            HTMLHelper.CreateNewTextDiv(div, 'Name: Self');
            return;
        }

        HTMLHelper.CreateNewTextDiv(div, 'Name');

        const nameInput = div.createEl('input', {
            type: 'text',
            value: concept.name
        });
        nameInput.className = 'gl-fill';

        view.registerDomEvent(nameInput, 'change', async () => {
            const newValue = nameInput.value;

            if (ConceptService.GetConceptByName(this.life, newValue) !== undefined) {
                nameInput.value = concept.name;
                new Notice('That name has already been used!');
                return;
            }
            
            ConceptService.ChangeConceptName(this.life, concept, newValue);
            await view.onSave();
        })
    }

    protected MakeAliasesEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.className = 'hbox';
        HTMLHelper.CreateNewTextDiv(div, 'Aliases:');
        const listEditor = new AliasListEditor(div.createDiv(), concept.aliases, view.onSave);
        listEditor.Render(view);
    }

    protected MakeCategoryEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.className = 'hbox';
        HTMLHelper.CreateNewTextDiv(div, 'Categories:');
        const listEditor = new CategoryListEditor(concept, div.createDiv(), concept.categoryKeys, view.onSave);
        listEditor.Render(view);
    }

    protected MakeObservationListDisplay(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ) {
        div.className = 'vbox';
        HTMLHelper.CreateNewTextDiv(div, 'Observations:');
        const listEditor = new RelatedObservationGridEditor(div.createDiv(), view.life, concept, view.onSave);
        listEditor.Render(view);
    }
}