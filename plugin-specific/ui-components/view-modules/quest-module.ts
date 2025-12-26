import { Life } from "plugin-specific/models/life";
import { GamifyLifeView } from "../gamify-life-view";
import { QuestCardListEditor } from "../list-editors/quest-card";

export function DisplayQuestModule(view: GamifyLifeView, life: Life, div: HTMLDivElement) {
    div.className = 'gl-scroll gl-fill gl-outer-div vbox';
    const listEditor = new QuestCardListEditor(div.createDiv(), life.concepts, view.onSave);
    listEditor.Render(view);
}