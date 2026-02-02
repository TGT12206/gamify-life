import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { playerKey } from "plugin-specific/models/const";
import { GenerateUniqueStringKey } from "ui-patterns/map-editor";
import { PageLoader } from "../page";

export class SelfModuleLoader extends PageLoader {
    Load(view: GamifyLifeView, div: HTMLDivElement): void {
        div.empty();
        div.className = 'gl-scroll gl-fill gl-outer-div vbox';
        let self = view.life.concepts.get(playerKey);
        if (self === undefined) {
            self = new Concept();
            view.life.concepts.set(GenerateUniqueStringKey(), self);
        }

        view.pageLoaders['Self'].Load(view, div, self);
    }
}