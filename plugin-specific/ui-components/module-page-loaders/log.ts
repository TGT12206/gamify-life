import { GamifyLifeView } from "../gamify-life-view";
import { Moment } from "plugin-specific/models/moment";
import { HTMLHelper } from "ui-patterns/html-helper";
import { MomentCardGrid } from "../list-editors/moment-card";
import { GenerateUniqueStringKey } from "ui-patterns/map-editor";
import { ModuleLoader } from "./module";

export class LogModuleLoader extends ModuleLoader {
    override internalData: Moment;
    Load(view: GamifyLifeView, div: HTMLDivElement): void {
        div.className = 'gl-scroll gl-fill gl-outer-div vbox';
    
        this.internalData = this.internalData === undefined ? this.CreateDefaultMoment() : this.internalData;

        const editorDiv = div.createDiv();
        view.momentLoader.Load(view, editorDiv, this.internalData);
        editorDiv.classList.remove('gl-scroll');

        const submitButton = div.createEl('button', { text: 'submit' } );
        submitButton.id = 'gl-submit'

        HTMLHelper.CreateNewTextDiv(div, 'Past moments:');

        const listEditor = new MomentCardGrid(div.createDiv(), view);
        listEditor.Render(view);

        const life = view.life;

        view.registerDomEvent(submitButton, 'click', async () => {
            life.concepts.set(GenerateUniqueStringKey(), this.internalData);
            await view.onSave();
            this.internalData = this.CreateDefaultMoment();
            div.empty();
            this.Load(view, div);
        });
    }
    private CreateDefaultMoment() {
        const moment = new Moment();
        moment.startTime.setHours(0, 0, 0, 0);
        moment.endTime.setHours(23, 59, 0, 0);
        return moment;
    }
}