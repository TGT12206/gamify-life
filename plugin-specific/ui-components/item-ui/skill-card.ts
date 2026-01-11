import { Concept } from "plugin-specific/models/concept";
import { GamifyLifeView } from "../gamify-life-view";
import { Skill } from "plugin-specific/models/skill";
import { MapEntryUI } from "ui-patterns/map-entry-ui";

export class SkillCardUI extends MapEntryUI<string, Concept> {
    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainMap: Map<string, Concept>,
        skill: Skill,
        onRefresh: (() => Promise<void>) | null,
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        div.classList.add('gl-bordered');
        div.classList.add('gl-fill');
        
        const nameButton = div.createEl('button', { text: skill.GetName(view.life) } );
        view.skillLoader.MakeProgressDisplay(view, div.createDiv(), skill);

        view.registerDomEvent(nameButton, 'click', () => {
            view.OpenCorrectConceptLoader(skill);
        });
    }
}