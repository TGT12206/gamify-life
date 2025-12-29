import { Life } from "plugin-specific/models/life";
import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { Moment } from "plugin-specific/models/moment";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GridEditor } from "ui-patterns/grid-editor";
import { HTMLHelper } from "ui-patterns/html-helper";
import { ConceptService } from "plugin-specific/services/concept";
import { Notice } from "obsidian";

export function DisplayLogModule(view: GamifyLifeView, life: Life, div: HTMLDivElement) {
    div.className = 'gl-scroll gl-fill gl-outer-div vbox';
    
    const newMoment = new Moment();
    InitializeMoment(newMoment);
    const editorDiv = div.createDiv();
    view.momentEditorMaker.MakeUI(view, editorDiv, newMoment);
    editorDiv.classList.remove('gl-scroll');

    const submitButton = div.createEl('button', { text: 'submit' } );
    submitButton.id = 'gl-submit'

    HTMLHelper.CreateNewTextDiv(div, 'Past moments:');

    const listEditor = new MomentCardGridEditor(div.createDiv(), life.concepts, view.onSave);
    listEditor.Render(view);

    view.registerDomEvent(submitButton, 'click', async () => {
        const nameIsTaken = ConceptService.CheckIfNameIsTaken(life, newMoment.name);
        if (nameIsTaken) {
            new Notice('That name is already taken!');
            return;
        }
        
        life.concepts.push(newMoment);
        await view.onSave();
        div.empty();
        DisplayLogModule(view, life, div);
    });
}

function InitializeMoment(moment: Moment) {
    moment.startTime.setHours(0, 0, 0, 0);
    moment.endTime.setHours(23, 59, 0, 0);
    
    const date = moment.startTime;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    moment.name = year + '/' + month + '/' + day;
}

export class MomentCardUIMaker extends ObjUIMaker<Concept> {
    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: Concept[],
        index: number
    ): Promise<void> {
        const moment = <Moment> mainArray[index];
        itemDiv.classList.add('gl-bordered');
        itemDiv.classList.add('gl-fill');
        
        const nameButton = itemDiv.createEl('button', { text: moment.name } );
        HTMLHelper.CreateNewTextDiv(itemDiv, moment.startTime.toDateString());

        view.registerDomEvent(nameButton, 'click', () => {
            view.OpenCorrectConceptEditor(mainArray[index]);
        });
    }
}

export class MomentCardGridEditor extends GridEditor<Concept> {
    private defaultValue = new Moment();
    constructor(parentDiv: HTMLDivElement, conceptKVs: Concept[], onSave: () => Promise<void>) {
        const uiMaker = new MomentCardUIMaker();
        const newObjMaker = () => {
            return new Moment();
        }
        super(undefined, parentDiv, conceptKVs, newObjMaker, uiMaker, onSave);
        this.isVertical = true;
        uiMaker.isVertical = true;
        this.enableAddButton = false;
    }
    override async RefreshList(view: GamifyLifeView): Promise<void> {
        const scrollTop = this.listDiv.scrollTop;
        this.listDiv.empty();
        if (this.isVertical) {
            this.listDiv.style.gridTemplateColumns = 'repeat(' + this.itemsPerLine + ', 1fr)';
        } else {
            this.listDiv.style.gridTemplateRows = 'repeat(' + this.itemsPerLine + ', 1fr)';
        }
        
        let momentIndices = [];

        for (let i = 0; i < view.life.concepts.length; i++) {
            if (!view.life.concepts[i].categoryKeys.contains('Moment')) {
                continue;
            }
            momentIndices.push(i);
        }
        
        const sortedIndices = [...momentIndices].sort((a, b) =>
            (<Moment> view.life.concepts[b]).startTime.getTime() - (<Moment> view.life.concepts[a]).startTime.getTime()
        );

        for (let i = 0; i < sortedIndices.length; i++) {
            const itemContainer = this.listDiv.createDiv('gl-outer-div gl-scroll ' + (this.objUIMaker.isVertical ? 'vbox' : 'hbox'));
            await this.objUIMaker.MakeUI(
                view,
                itemContainer,
                this.mainArray,
                sortedIndices[i],
                this.onSave,
                async () => {
                    await this.onSave();
                    await this.RefreshList(view);
                }
            );
        }
        this.listDiv.scrollTop = scrollTop;
    }
}