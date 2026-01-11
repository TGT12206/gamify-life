import { GamifyLifeView } from "../gamify-life-view";
import { QuestCardList } from "../list-editors/quest-card";
import { ModuleLoader } from "./module";

export class QuestModuleLoader extends ModuleLoader {
    Load(view: GamifyLifeView, div: HTMLDivElement): void {
        div.className = 'gl-scroll gl-fill gl-outer-div vbox';
        const listEditor = new QuestCardList(div.createDiv(), view);
        listEditor.Render(view);
    }
}