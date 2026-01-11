import { Concept } from "plugin-specific/models/concept";
import { GamifyLifeView } from "../gamify-life-view";
import { GenerateUniqueStringKey, MapEditor, MapEntry } from "ui-patterns/map-editor";
import { RelatedClaimCardUI } from "../item-ui/related-claim";
import { Claim } from "plugin-specific/models/claim";

export class RelatedClaimGrid extends MapEditor<string, Concept> {
    constructor(subject: Concept, div: HTMLDivElement, view: GamifyLifeView) {
        const allConcepts = view.life.concepts;
        const itemUI = new RelatedClaimCardUI();
        super(div, view.life.concepts, itemUI);
        
        this.globalData = subject;
        const subjectKey = <string> view.life.FindKey(subject);

        this.makeNewEntry = () => {
            const key = GenerateUniqueStringKey();
            const value = new Claim();
            value.conceptKeys.push(subjectKey);
            return new MapEntry(key, value);
        };
        this.onSave = view.onSave;
        
        const life = view.life;

        this.simpleDisplayFilter = entry => {
            if (entry.value.baseCategory !== 'Claim') return false;
            const claim = <Claim> entry.value;
            for (const key of claim.conceptKeys) {
                if (allConcepts.get(key) === subject) return true;
            }
            return false;
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