import { ArrayEditor } from "ui-patterns/array-editor";
import { GamifyLifeView } from "../gamify-life-view";
import { Skill } from "plugin-specific/models/skill";
import { RankKeyUI } from "../item-ui/rank-key";
import { Concept } from "plugin-specific/models/concept";

export class RankKeyArrayEditor extends ArrayEditor<string> {
    constructor(skill: Skill, div: HTMLDivElement, view: GamifyLifeView) {
        const itemUI = new RankKeyUI(skill);
        super(div, skill.rankKeys, itemUI);
        
        this.globalData = skill;

        this.makeNewItem = () => '';
        this.onSave = view.onSave;

        const life = view.life;

        this.simpleDisplayOrder = (a, b) => Concept.alphabeticComparisonByKeys(a, b, life);
        
        this.isVertical = false;
        this.itemsPerLine = 1;
        this.enableAddButton = true;
        this.indexedBased = true;

        itemUI.isVertical = true;

        this.Render(view);
    }
}