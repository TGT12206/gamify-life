import { Moment } from "plugin-specific/models/moment";
import { GainedSkillUnit, Skill, SkillUnit } from "plugin-specific/models/skill";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { KeyService } from "plugin-specific/services/key";
import { HTMLHelper } from "ui-patterns/html-helper";
import { ConceptService } from "plugin-specific/services/concept";
import { ConceptSuggest } from "../suggest/concept-suggest";

export class GainedSkillUnitUIMaker extends ObjUIMaker<GainedSkillUnit> {
    get moment(): Moment {
        return <Moment> this.globalData;
    }
    set moment(newMoment: Moment) {
        this.globalData = newMoment;
    }

    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: GainedSkillUnit[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        const life = view.life;
        const moment = this.moment;
        const unitGained = mainArray[index];
        const getUnitType = (unitGained: GainedSkillUnit) => {
            try {
                const skill = <Skill> ConceptService.GetConceptByName(life, unitGained.skillName);
                const unitType = <SkillUnit> ConceptService.GetConceptByName(life, skill.unitName);
                return unitType;
            } catch {
                return undefined
            }
        }
        const unitType = getUnitType(unitGained);

        if (getUnitType(unitGained) === undefined) {
            const startTime = moment.startTime.getTime();
            const endTime = moment.endTime.getTime();
            unitGained.unitsGained = (endTime - startTime) / 3600000;
        }

        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        const shiftButtonsDiv = itemDiv.createDiv(this.isVertical ? 'hbox' : 'vbox');

        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'left' : 'up', onRefresh);
        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'right' : 'down', onRefresh);

        const numUnitsDiv = itemDiv.createDiv('hbox');
        HTMLHelper.CreateNewTextDiv(itemDiv, 'Skill:');
        const skillKeyInput = itemDiv.createEl('input', { type: 'text', value: unitGained.skillName } );

        const unitGainedInput = numUnitsDiv.createEl('input', { type: 'number', value: unitGained.unitsGained + '' } );
        HTMLHelper.CreateNewTextDiv(numUnitsDiv, unitType ? unitType.name : 'Hours Spent');

        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        const updateSkillKey = async (skill: Skill) => {
            mainArray[index].skillName = skill.name;
            await onSave();
        };
        new ConceptSuggest(skillKeyInput, view.life, undefined, view.app, updateSkillKey, ['Skill']);

        view.registerDomEvent(unitGainedInput, 'change', async () => {
            unitGained.unitsGained = parseFloat(unitGainedInput.value);
            await onSave();
        });
    }
}