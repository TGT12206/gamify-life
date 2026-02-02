import { GamifyLifeView } from "../gamify-life-view";
import { Moment } from "plugin-specific/models/moment";
import { HTMLHelper } from "ui-patterns/html-helper";
import { MomentCardGrid } from "../list-editors/moment-card";
import { GenerateUniqueStringKey } from "ui-patterns/map-editor";
import { PageLoader } from "../page";

export class LogModuleLoader extends PageLoader {
    Load(view: GamifyLifeView, div: HTMLDivElement, currentMoment: Moment): void {
        div.empty();
        div.className = 'gl-scroll gl-fill gl-outer-div vbox';

        const editorDiv = div.createDiv();
        view.pageLoaders['Moment'].Load(view, editorDiv, currentMoment);
        editorDiv.classList.remove('gl-scroll');

        const submitButton = div.createEl('button', { text: 'submit' } );
        submitButton.id = 'gl-submit'

        HTMLHelper.CreateNewTextDiv(div, 'Past moments:');

        const listEditor = new MomentCardGrid(div.createDiv(), view);
        listEditor.Render(view);

        const life = view.life;

        view.registerDomEvent(submitButton, 'click', async () => {
            life.concepts.set(GenerateUniqueStringKey(), <Moment> currentMoment);
            await view.onSave();
            currentMoment = this.CreateDefaultMoment();
            div.empty();
            this.Load(view, div, currentMoment);
        });
    }
    CreateDefaultMoment() {
        const moment = new Moment();
        moment.startTime.setHours(0, 0, 0, 0);
        moment.endTime.setHours(23, 59, 0, 0);
        return moment;
    }
}