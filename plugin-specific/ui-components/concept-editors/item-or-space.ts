import { GamifyLifeView } from "../gamify-life-view";
import { ConceptLoader } from "./concept";
import { HTMLHelper } from "ui-patterns/html-helper";
import { ItemOrSpace } from "plugin-specific/models/item-or-space";
import { SubspaceReferenceArrayEditor } from "../list-editors/subspace";

export class ItemOrSpaceLoader extends ConceptLoader {
    override Load(view: GamifyLifeView, div: HTMLDivElement, space: ItemOrSpace, doCheck: boolean = false) {
        super.Load(view, div, space, doCheck);
        this.MakeSubspaceEditor(view, div.createDiv(), space);
    }
    
    MakeSubspaceEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        space: ItemOrSpace
    ) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Subspaces:');
        new SubspaceReferenceArrayEditor(space, div.createDiv(), view);
    }
}