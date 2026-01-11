import { GamifyLifeView } from "../gamify-life-view";
import { ConceptLoader } from "./concept";
import { Skill, Unit } from "plugin-specific/models/skill";
import { HTMLHelper } from "ui-patterns/html-helper";
import { ConceptKeySuggest } from "../suggest/concept-key-suggest";
import { RankKeyArrayEditor } from "../list-editors/rank-key";
import { SubskillReferenceArrayEditor } from "../list-editors/subskill";
import { MapEntry } from "ui-patterns/map-editor";

export class SkillLoader extends ConceptLoader {
    override Load(
        view: GamifyLifeView,
        div: HTMLDivElement,
        skill: Skill,
        doCheck: boolean = false
    ) {
        div.empty();
        div.className = 'vbox gl-scroll gl-outer-div gl-fill';
        
        if (doCheck && this.CheckIfConceptIsSaved(view, div, skill)) return;
        
        this.MakeProgressDisplay(view, div, skill);
        this.MakeAliasesEditor(view, div.createDiv(), skill);
        this.MakeCategoryEditor(view, div.createDiv(), skill);
        this.MakeMediaListEditor(view, div.createDiv(), skill);
        this.MakeDescriptionEditor(view, div.createDiv(), skill);
        this.MakeUnitEditor(view, div.createDiv(), <Skill> skill);
        this.MakeRanksEditor(view, div.createDiv(), <Skill> skill);
        this.MakeSubskillsEditor(view, div.createDiv(), <Skill> skill);
        this.MakeObservationListDisplay(view, div.createDiv(), skill);
    }

    MakeProgressDisplay(view: GamifyLifeView, div: HTMLDivElement, skill: Skill) {
        const progress = skill.GetRankProgress(view.life);
        const numUnits = progress.totalUnits;

        if (progress.current !== undefined) {
            HTMLHelper.CreateNewTextDiv(div, 'Rank: ' + progress.current.GetName(view.life));
            if (progress.current.mediaPaths.length > 0) view.mediaRenderer.renderMedia(div.createDiv('hbox'), view, progress.current.mediaPaths[0]);
        }
        
        const progressDiv = div.createDiv('hbox gl-outer-div');
        const progressBar = progressDiv.createDiv('gl-fill gl-bordered gl-progress');
        progressBar.style.setProperty('--progress', (progress.progress * 100) + '%');
        
        if (progress.next !== undefined) {
            progressBar.textContent = numUnits + '/' + progress.next.threshold;
            HTMLHelper.CreateNewTextDiv(progressDiv, 'Next Rank: ' + progress.next.GetName(view.life));
            if (progress.next.mediaPaths.length > 0) view.mediaRenderer.renderMedia(div.createDiv('hbox'), view, progress.next.mediaPaths[0]);
        } else if (progress.current !== undefined) {
            progressBar.textContent = numUnits + '/' + progress.current.threshold;
        } else {
            progressBar.textContent = numUnits + '';
        }
    }
    
    MakeUnitEditor(view: GamifyLifeView, div: HTMLDivElement, skill: Skill) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'XP unit for this skill:');
        const input = div.createEl('input', { type: 'text', value: skill.unitKey } );
        const selectUnit = async (entry: MapEntry<string, Unit>) => {
            skill.unitKey = entry.key;
            await view.onSave();
        };
        new ConceptKeySuggest(input, view.life, skill, view.app, selectUnit, ['Unit']);
    }
    
    MakeRanksEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        skill: Skill
    ) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Ranks:');
        new RankKeyArrayEditor(skill, div.createDiv(), view);
    }

    MakeSubskillsEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        skill: Skill
    ) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'Subskills:');
        new SubskillReferenceArrayEditor(skill, div.createDiv(), view);
    }
}