import { HTMLHelper } from "ui-patterns/html-helper";
import { GamifyLifeView } from "../gamify-life-view";
import { CategoryList } from "../list-editors/category";
import { PageLoader } from "../page";

export class CategoryModuleLoader extends PageLoader {
    Load(view: GamifyLifeView, div: HTMLDivElement): void {
        div.empty();
        div.className = 'gl-scroll gl-fill gl-outer-div vbox';
        HTMLHelper.CreateNewTextDiv(div, 'Concept categories');
        new CategoryList(div.createDiv(), view);
    }
}