import { Moment } from "plugin-specific/models/moment";
import { EarnedSkillUnit, Skill, Unit } from "plugin-specific/models/skill";
import { ArrayItemUI } from "ui-patterns/array-item-ui";
import { GamifyLifeView } from "../gamify-life-view";
import { HTMLHelper } from "ui-patterns/html-helper";
import { ConceptKeySuggest } from "../suggest/concept-key-suggest";
import { MapEntry } from "ui-patterns/map-editor";

export class EarnedSkillUnitUI extends ArrayItemUI<EarnedSkillUnit> {
    get moment(): Moment {
        return <Moment> this.globalData;
    }
    set moment(newMoment: Moment) {
        this.globalData = newMoment;
    }

    constructor(moment: Moment) {
        super();
        this.moment = moment;
    }

    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: EarnedSkillUnit[],
        unitEarned: EarnedSkillUnit,
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        const life = view.life;
        const moment = this.moment;
        const getUnitType = () => {
            try {
                const skill = <Skill> life.concepts.get(unitEarned.skillKey);
                const unitType = <Unit> life.concepts.get(skill.unitKey);
                return unitType;
            } catch {
                return undefined
            }
        }
        const unitType = getUnitType();

        if (getUnitType() === undefined) {
            const startTime = moment.startTime.getTime();
            const endTime = moment.endTime.getTime();
            unitEarned.unitsEarned = (endTime - startTime) / 3600000;
        }

        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-div');

        const numUnitsDiv = div.createDiv('hbox');
        HTMLHelper.CreateNewTextDiv(div, 'Skill:');
        const skillKeyInput = div.createEl('input', { type: 'text', value: unitEarned.skillKey } );

        const unitGainedInput = numUnitsDiv.createEl('input', { type: 'number', value: unitEarned.unitsEarned + '' } );
        const unitName = HTMLHelper.CreateNewTextDiv(numUnitsDiv, unitType?.GetName(view.life) ?? 'Unknown unit');

        this.MakeDeleteButton(view, div, mainArray, unitEarned, onRefresh);

        const selectSkillKey = async (skillEntry: MapEntry<string, Skill>) => {
            unitEarned.skillKey = skillEntry.key;
            unitName.textContent = skillEntry.value.unitKey;
            if (onSave !== null) await onSave();
        };
        new ConceptKeySuggest(skillKeyInput, view.life, moment, view.app, selectSkillKey, ['Skill']);

        view.registerDomEvent(unitGainedInput, 'change', async () => {
            unitEarned.unitsEarned = parseFloat(unitGainedInput.value);
            if (onSave !== null) await onSave();
        });
    }
}