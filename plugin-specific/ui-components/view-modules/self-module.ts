import { Life } from "plugin-specific/models/life";
import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { ConceptService } from "plugin-specific/services/concept";

export function DisplaySelfModule(view: GamifyLifeView, life: Life, div: HTMLDivElement) {
    div.className = 'gl-scroll gl-fill gl-outer-div vbox';
    const selfOrUndefined = ConceptService.GetConceptByName(life, 'Self');
    if (selfOrUndefined === undefined) {
        const self = new Concept();
        self.name = 'Self';
        life.concepts.push(self);
    }
    
    const self = selfOrUndefined === undefined ? <Concept> ConceptService.GetConceptByName(life, 'Self') : selfOrUndefined;
    view.selfEditorMaker.MakeUI(view, div, self);
}