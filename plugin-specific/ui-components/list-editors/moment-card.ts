import { Concept } from "plugin-specific/models/concept";
import { GamifyLifeView } from "../gamify-life-view";
import { GenerateUniqueStringKey, MapEditor, MapEntry } from "ui-patterns/map-editor";
import { Moment } from "plugin-specific/models/moment";
import { MomentCardUI } from "../item-ui/moment-card";

export class MomentCardGrid extends MapEditor<string, Concept> {
    constructor(div: HTMLDivElement, view: GamifyLifeView) {
        const itemUI = new MomentCardUI();
        super(div, view.life.concepts, itemUI);

        this.makeNewEntry = () => {
            const key = GenerateUniqueStringKey();
            const value = new Moment();
            
            value.startTime.setHours(0, 0, 0, 0);
            value.endTime.setHours(23, 59, 0, 0);
            
            const date = value.startTime;
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            value.aliases.push(year + '/' + month + '/' + day);

            return new MapEntry(key, value)
        };
        this.onSave = view.onSave;
        
        this.simpleDisplayFilter = entry => entry.value.baseCategory === 'Moment';
        this.simpleDisplayOrder = (a: MapEntry<string, Moment>, b: MapEntry<string, Moment>) => b.value.startTime.getTime() - a.value.startTime.getTime();
        
        this.isVertical = true;
        this.itemsPerLine = 5;
        this.enableAddButton = true;
        this.keyBased = false;

        itemUI.isVertical = true;

        this.Render(view);
    }
}