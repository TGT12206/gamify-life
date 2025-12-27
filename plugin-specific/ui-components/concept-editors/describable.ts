import { HTMLHelper } from "ui-patterns/html-helper";
import { Life } from "plugin-specific/models/life";
import { GamifyLifeView } from "../gamify-life-view";
import { Describable } from "plugin-specific/models/concept";
import { MediaOfDescribableListEditor } from "../list-editors/media-of-describable";

export class DescribableEditorUIMaker {
    constructor(public life: Life) {}

    MakeUI(
        view: GamifyLifeView,
        div: HTMLDivElement,
        describable: Describable
    ) {
        div.empty();
        div.className = 'vbox gl-scroll gl-outer-div gl-fill';
        this.MakeMediaListEditor(view, div.createDiv(), describable);
        this.MakeDescriptionEditor(view, div.createDiv(), describable);
    }
    
    MakeMediaListEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        describable: Describable
    ) {
        div.className = 'hbox';
        HTMLHelper.CreateNewTextDiv(div, 'Media:');
        const listEditor = new MediaOfDescribableListEditor(this.life, div.createDiv(), describable.mediaKeys, view.onSave);
        listEditor.Render(view);
    }

    MakeDescriptionEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        describable: Describable
    ) {
        div.empty();
        div.addClass('vbox'); 

        HTMLHelper.CreateNewTextDiv(div, 'Description');

        const input = div.createEl('textarea', {
            text: describable.description
        });
        input.className = 'gl-fill';

        view.registerDomEvent(input, 'change', async () => {
            describable.description = input.value;
            await view.onSave();
        });
    }
}