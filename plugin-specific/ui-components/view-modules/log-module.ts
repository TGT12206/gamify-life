import { Life } from "plugin-specific/models/life";
import { GamifyLifeView } from "../gamify-life-view";
import { KeyValue } from "plugin-specific/models/key-value";
import { Concept } from "plugin-specific/models/concept";
import { Moment } from "plugin-specific/models/moment";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GridEditor } from "ui-patterns/grid-editor";
import { HTMLHelper } from "ui-patterns/html-helper";

export function DisplayLogModule(view: GamifyLifeView, life: Life, div: HTMLDivElement) {
    div.className = 'gl-scroll gl-fill gl-outer-div vbox';
    
    const newMoment = new Moment();
    newMoment.categoryKeys.push('Moment');
    view.momentEditorMaker.MakeUI(view, div.createDiv(), newMoment);

    const submitButton = div.createEl('button', { text: 'submit' } );

    HTMLHelper.CreateNewTextDiv(div, 'Past moments:');

    const listEditor = new MomentCardGridEditor(div.createDiv(), life.concepts, view.onSave);
    listEditor.Render(view);

    view.registerDomEvent(submitButton, 'click', async () => {
        life.concepts.push(new KeyValue(newMoment.startTime.toDateString() + '-' + newMoment.endTime.toDateString(), newMoment));
        DisplayLogModule(view, life, div);
    });
}

export class MomentCardUIMaker extends ObjUIMaker<KeyValue<Concept>> {
    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: KeyValue<Concept>[],
        index: number
    ): Promise<void> {
        const moment = <Moment> mainArray[index].value;
        itemDiv.classList.add('gl-bordered');
        itemDiv.classList.add('gl-fit-content');
        
        const nameButton = itemDiv.createEl('button', { text: moment.name } );
        HTMLHelper.CreateNewTextDiv(itemDiv, moment.startTime.toDateString());

        view.registerDomEvent(nameButton, 'click', () => {
            view.OpenCorrectConceptEditor(mainArray[index].value);
        });
    }
}

export class MomentCardGridEditor extends GridEditor<KeyValue<Concept>> {
    private defaultValue = new Moment();
    constructor(parentDiv: HTMLDivElement, conceptKVs: KeyValue<Concept>[], onSave: () => Promise<void>) {
        const uiMaker = new MomentCardUIMaker();
        const newObjMaker = () => {
            const newMoment = new Moment();
            newMoment.categoryKeys.push('Moment');
            return new KeyValue('', newMoment);
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
            if (!view.life.concepts[i].value.categoryKeys.contains('Moment')) {
                continue;
            }
            momentIndices.push(i);
        }
        
        const sortedIndices = [...momentIndices].sort((a, b) =>
            (<Moment> view.life.concepts[b].value).startTime.getTime() - (<Moment> view.life.concepts[a].value).startTime.getTime()
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