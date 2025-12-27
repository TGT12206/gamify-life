import { ConceptEditorUIMaker } from "./concept";
import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { SkillCardGridEditor } from "../list-editors/skill-card";

export class SelfEditorUIMaker extends ConceptEditorUIMaker {
    override MakeUI(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ): void {
        super.MakeUI(view, div, concept);
        this.MakeSkillCardGrid(view, div.createDiv());
    }
    MakeSkillCardGrid(
        view: GamifyLifeView,
        div: HTMLDivElement
    ) {
        const listEditor = new SkillCardGridEditor(div, this.life.concepts, view.onSave);
        listEditor.Render(view);
    }

}