import { Concept } from "plugin-specific/models/concept";
import { GamifyLifeView } from "../gamify-life-view";
import { ConceptEditorUIMaker } from "./concept";
import { Rank, Skill } from "plugin-specific/models/skill";
import { HTMLHelper } from "ui-patterns/html-helper";
import { ListEditor } from "ui-patterns/list-editor";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { ConceptKeySuggest } from "../suggest/concept-key-suggest";
import { ConceptService } from "plugin-specific/services/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { SubskillKeySuggest } from "../suggest/subskill-key-suggest";
import { SkillService } from "plugin-specific/services/skill";

export class SkillEditorUIMaker extends ConceptEditorUIMaker {
    override MakeUI(view: GamifyLifeView, div: HTMLDivElement, skill: Skill) {
        div.empty();
        div.className = 'vbox gl-scroll gl-outer-div gl-fill';
        this.MakeNameEditor(view, div.createDiv(), skill);
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
        const numUnits = SkillService.CalculateNumberOfUnits(view.life, skill);
        const progress = SkillService.GetRankProgress(view.life, skill, numUnits);

        if (progress.current !== null) {
            HTMLHelper.CreateNewTextDiv(div, 'Rank: ' + progress.current.name);
        }
        
        const progressDiv = div.createDiv('hbox gl-outer-div');
        const progressBar = progressDiv.createDiv('gl-fill gl-bordered');
        
        const filledPortion = progressBar.createDiv();
        const emptyPortion = progressBar.createDiv();
        
        filledPortion.id = 'gl-progress-bar-fill';
        emptyPortion.id = 'gl-progress-bar-empty';

        filledPortion.style.width = (progress.progress * 100) + '%';
        
        if (progress.next !== null) {
            filledPortion.textContent = numUnits + '/' + progress.next.threshold;
            HTMLHelper.CreateNewTextDiv(progressDiv, 'Next Rank: ' + progress.next.name);
        } else if (progress.current !== null) {
            filledPortion.textContent = numUnits + '/' + progress.current.threshold;
        } else {
            filledPortion.textContent = numUnits + '';
        }
    }
    
    MakeUnitEditor(view: GamifyLifeView, div: HTMLDivElement, skill: Skill) {
        div.className = 'hbox gl-outer-div';
        HTMLHelper.CreateNewTextDiv(div, 'XP unit for this skill:');
        const input = div.createEl('input', { type: 'text', value: ConceptService.GetNameFromKey(view.life, skill.unitKey) } );
        const updateKey = async (conceptKV: KeyValue<Concept>) => {
            skill.unitKey = conceptKV.key;
            await view.onSave();
        };
        new ConceptKeySuggest(input, view.life, skill, view.app, updateKey, ['Skill Unit']);
    }
    
    MakeRanksEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        skill: Skill
    ) {
        div.className = 'hbox';
        HTMLHelper.CreateNewTextDiv(div, 'Ranks:');
        const listEditor = new RankListEditor(div.createDiv(), skill.rankKeys, view.onSave);
        listEditor.Render(view);
    }

    MakeSubskillsEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        skill: Skill
    ) {
        div.className = 'hbox';
        HTMLHelper.CreateNewTextDiv(div, 'Subskills:');
        const listEditor = new SubskillListEditor(skill, div.createDiv(), skill.subskills, view.onSave);
        listEditor.Render(view);
    }
}

//#region Rank
export class RankUIMaker extends ObjUIMaker<string> {
    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: string[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        const shiftButtonsDiv = itemDiv.createDiv(this.isVertical ? 'hbox' : 'vbox');

        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'left' : 'up', onRefresh);
        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'right' : 'down', onRefresh);
        
        const rankInput = itemDiv.createEl('input', { type: 'text', value: ConceptService.GetNameFromKey(view.life, mainArray[index]) } );

        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        const updateRank = async (conceptKV: KeyValue<Rank>) => {
            mainArray[index] = conceptKV.key;
            await onSave();
        };
        new ConceptKeySuggest(rankInput, view.life, undefined, view.app, updateRank, ['Skill Rank']);
    }
}

export class RankListEditor extends ListEditor<string> {
    constructor(parentDiv: HTMLDivElement, ranks: string[], onSave: () => Promise<void>) {
        const uiMaker = new RankUIMaker();
        super(undefined, parentDiv, ranks, () => { return '' }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}
//#endregion Rank

//#region Subskill
export class SubskillUIMaker extends ObjUIMaker<{ key: string, weight: number }> {
    get root(): Skill {
        return <Skill> this.globalData;
    }
    set root(newRoot: Skill) {
        this.globalData = newRoot;
    }

    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: { key: string, weight: number }[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        const shiftButtonsDiv = itemDiv.createDiv(this.isVertical ? 'hbox' : 'vbox');

        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'left' : 'up', onRefresh);
        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'right' : 'down', onRefresh);
        
        const keyInput = itemDiv.createEl('input', { type: 'text', value: ConceptService.GetNameFromKey(view.life, mainArray[index].key) } );
        const weightInput = itemDiv.createEl('input', { type: 'number', value: mainArray[index].weight + '' } );
        
        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        const updateKey = async (conceptKV: KeyValue<Concept>) => {
            mainArray[index].key = conceptKV.key;
            await onSave();
        };
        new SubskillKeySuggest(keyInput, view.life, this.root, view.app, updateKey);

        view.registerDomEvent(weightInput, 'change', async () => {
            mainArray[index].weight = parseFloat(weightInput.value);
            await onSave();
        });
    }
}

export class SubskillListEditor extends ListEditor<{ key: string, weight: number }> {
    constructor(root: Skill, parentDiv: HTMLDivElement, subskills: { key: string, weight: number }[], onSave: () => Promise<void>) {
        const uiMaker = new SubskillUIMaker();
        super(root, parentDiv, subskills, () => { return { key: '', weight: 0 } }, uiMaker, onSave);
        this.isVertical = false;
        uiMaker.isVertical = true;
    }
}
//#endregion Subskill