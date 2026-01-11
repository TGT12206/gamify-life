import { ArrayItemUI } from "ui-patterns/array-item-ui";
import { GamifyLifeView } from "../gamify-life-view";
import { Rank, Skill } from "plugin-specific/models/skill";
import { ConceptKeySuggest } from "../suggest/concept-key-suggest";
import { MapEntry } from "ui-patterns/map-editor";

export class RankKeyUI extends ArrayItemUI<string> {
    get skill(): Skill {
        return <Skill> this.globalData;
    }
    set skill(newSkill: Skill) {
        this.globalData = newSkill;
    }

    constructor(skill: Skill) {
        super();
        this.skill = skill;
    }

    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: string[],
        itemAccess: { index: number },
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-div');

        const index = itemAccess.index;
        
        const rankInput = div.createEl('input', { type: 'text', value: mainArray[index] } );
        const mediaDiv = div.createDiv('hbox');

        this.MakeDeleteButton(view, div, mainArray, itemAccess, onRefresh);

        const selectRank = async (entry: MapEntry<string, Rank>) => {
            mainArray[index] = entry.key;
            if (onSave !== null) await onSave();
            const rank = entry.value;
            if (rank.mediaPaths.length > 0) view.mediaRenderer.renderMedia(mediaDiv, view, rank.mediaPaths[0]);
        };
        new ConceptKeySuggest(rankInput, view.life, this.skill, view.app, selectRank, ['Rank']);
    }
}