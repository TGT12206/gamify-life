import { Life } from "plugin-specific/models/life";
import { GamifyLifeView } from "../gamify-life-view";
import { KeyService } from "plugin-specific/services/key";
import { KeyValue } from "plugin-specific/models/key-value";
import { Concept } from "plugin-specific/models/concept";

export function DisplaySelfModule(view: GamifyLifeView, life: Life, div: HTMLDivElement) {
    div.className = 'gl-scroll gl-fill gl-outer-div vbox';
    const selfOrUndefined = KeyService.Get(life.concepts, 'Self');
    if (selfOrUndefined === undefined) {
        life.concepts.push(new KeyValue('Self', new Concept()));
    }
    
    const self = <Concept> KeyService.Get(life.concepts, 'Self');
    view.selfEditorMaker.MakeUI(view, div, self);
}