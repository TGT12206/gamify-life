import { ConceptLoader } from "./concept";
import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { SkillCardGrid } from "../list-editors/skill-card";

export class SelfLoader extends ConceptLoader {
    override Load(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept,
        doCheck: boolean = false
    ): void {
        super.Load(view, div, concept, doCheck);
        this.MakeSkillCardGrid(view, div.createDiv());
    }
    MakeSkillCardGrid(
        view: GamifyLifeView,
        div: HTMLDivElement
    ) {
        new SkillCardGrid(div, view);
    }
}