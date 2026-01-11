import { Concept } from "plugin-specific/models/concept";
import { Skill } from "plugin-specific/models/skill";
import { GamifyLifeView } from "../gamify-life-view";
import { GenerateUniqueStringKey, MapEditor, MapEntry } from "ui-patterns/map-editor";
import { SkillCardUI } from "../item-ui/skill-card";

export class SkillCardGrid extends MapEditor<string, Concept> {
    constructor(div: HTMLDivElement, view: GamifyLifeView) {
        const itemUI = new SkillCardUI();
        super(div, view.life.concepts, itemUI);

        this.makeNewEntry = () => {
            const key = GenerateUniqueStringKey();
            const value = new Skill();
            return new MapEntry(key, value);
        };
        this.onSave = view.onSave;
        
        const life = view.life;

        this.simpleDisplayFilter = entry => {
            return entry.value.baseCategory === 'Skill';
        };
        this.simpleDisplayOrder = (a, b) => Concept.alphabeticComparison(a.value, b.value, life);
        
        this.isVertical = true;
        this.itemsPerLine = 5;
        this.enableAddButton = true;
        this.keyBased = false;

        itemUI.isVertical = true;

        this.Render(view);
    }
}