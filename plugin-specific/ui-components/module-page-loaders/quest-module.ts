import { GamifyLifeView } from "../gamify-life-view";
import { QuestCardList } from "../list-editors/quest-card";
import { PageLoader } from "../page";

export class QuestModuleLoader extends PageLoader {
    Load(view: GamifyLifeView, div: HTMLDivElement): void {
        div.empty();
        div.className = 'gl-scroll gl-fill gl-outer-div vbox';
        const listEditor = new QuestCardList(div.createDiv(), view);
        listEditor.Render(view);
    }
}