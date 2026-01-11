import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { playerKey } from "plugin-specific/models/const";
import { GenerateUniqueStringKey } from "ui-patterns/map-editor";
import { ModuleLoader } from "./module";

export class SelfModuleLoader extends ModuleLoader {
    Load(view: GamifyLifeView, div: HTMLDivElement): void {
        div.className = 'gl-scroll gl-fill gl-outer-div vbox';
        let self = view.life.concepts.get(playerKey);
        if (self === undefined) {
            self = new Concept();
            view.life.concepts.set(GenerateUniqueStringKey(), self);
        }

        view.selfLoader.Load(view, div, self);
    }
}