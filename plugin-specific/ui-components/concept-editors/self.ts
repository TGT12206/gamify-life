import { ConceptEditorUIMaker } from "./concept";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { Concept } from "plugin-specific/models/concept";
import { Skill } from "plugin-specific/models/skill";
import { HTMLHelper } from "ui-patterns/html-helper";
import { GridEditor } from "ui-patterns/grid-editor";
import { KeyValue } from "plugin-specific/models/key-value";
import { ItemView, Notice, setIcon } from "obsidian";
import { KeyService } from "plugin-specific/services/key";

export class SelfEditorUIMaker extends ConceptEditorUIMaker {
    override MakeUI(
        view: GamifyLifeView,
        div: HTMLDivElement,
        concept: Concept
    ): void {
        super.MakeUI(view, div, concept);
        this.MakeSkillCardGrid(view, div.createDiv());
    }
    MakeSkillCardGrid(
        view: GamifyLifeView,
        div: HTMLDivElement
    ) {
        const listEditor = new SkillCardGridEditor(div, this.life.concepts, view.onSave);
        listEditor.Render(view);
    }

}

export class SkillCardUIMaker extends ObjUIMaker<KeyValue<Concept>> {
    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: KeyValue<Concept>[],
        index: number
    ): Promise<void> {
        const skill = <Skill> mainArray[index].value;
        itemDiv.classList.add('gl-bordered');
        itemDiv.classList.add('gl-fit-content');
        
        const nameButton = itemDiv.createEl('button', { text: skill.name } );
        view.skillEditorMaker.MakeProgressDisplay(view, itemDiv.createDiv(), skill);

        view.registerDomEvent(nameButton, 'click', () => {
            view.OpenCorrectConceptEditor(mainArray[index].value);
        });
    }
}

export class SkillCardGridEditor extends GridEditor<KeyValue<Concept>> {
    private defaultValue = new Skill();
    constructor(parentDiv: HTMLDivElement, conceptKVs: KeyValue<Concept>[], onSave: () => Promise<void>) {
        const uiMaker = new SkillCardUIMaker();
        const newObjMaker = () => {
            const newSkill = new Skill();
            newSkill.categoryKeys.push('Skill');
            return new KeyValue('', newSkill);
        }
        super(undefined, parentDiv, conceptKVs, newObjMaker, uiMaker, onSave);
        this.isVertical = true;
        uiMaker.isVertical = true;
    }
    override async RefreshList(view: ItemView): Promise<void> {
        const scrollTop = this.listDiv.scrollTop;
        this.listDiv.empty();
        if (this.isVertical) {
            this.listDiv.style.gridTemplateColumns = 'repeat(' + this.itemsPerLine + ', 1fr)';
        } else {
            this.listDiv.style.gridTemplateRows = 'repeat(' + this.itemsPerLine + ', 1fr)';
        }
        
        for (let i = 0; i < this.mainArray.length; i++) {
            if (!this.mainArray[i].value.categoryKeys.contains('Skill')) {
                continue;
            }
            const itemContainer = this.listDiv.createDiv('gl-outer-div gl-scroll ' + (this.objUIMaker.isVertical ? 'vbox' : 'hbox'));
            await this.objUIMaker.MakeUI(
                view,
                itemContainer,
                this.mainArray,
                i,
                this.onSave,
                async () => {
                    await this.onSave();
                    await this.RefreshList(view);
                }
            );
        }
        this.listDiv.scrollTop = scrollTop;
    }
    protected override CreateAddButton(view: GamifyLifeView): void {
        const mainArray = this.mainArray;
        const anchor = this.parentDiv.createDiv('gl-pos-anchor');
        const addButton = anchor.createEl('button');
        setIcon(addButton, 'plus');
        addButton.id = 'gl-grid-add-button';

        view.registerDomEvent(addButton, 'click', async () => {
            if (KeyService.HasKey(mainArray, '') || KeyService.HasValue(mainArray, this.defaultValue, (a, b) => { return a.name === b.name } )) {
                new Notice('Name the empty entry first!');
                return;
            }
            const newItem = await this.newObjMaker();
            mainArray.push(newItem);
            await this.onSave();
            view.OpenCorrectConceptEditor(newItem.value);
        });
    }
}