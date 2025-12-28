import { Concept } from "plugin-specific/models/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { GridEditor } from "ui-patterns/grid-editor";
import { SkillCardUIMaker } from "../ui-makers/skill-card";
import { Skill } from "plugin-specific/models/skill";
import { GamifyLifeView } from "../gamify-life-view";
import { Notice, setIcon } from "obsidian";
import { ConceptService } from "plugin-specific/services/concept";

export class SkillCardGridEditor extends GridEditor<Concept> {
    private defaultValue = new Skill();
    constructor(parentDiv: HTMLDivElement, concepts: Concept[], onSave: () => Promise<void>) {
        const uiMaker = new SkillCardUIMaker();
        const newObjMaker = () => {
            const newSkill = new Skill();
            newSkill.categoryKeys.push('Skill');
            return newSkill;
        }
        super(undefined, parentDiv, concepts, newObjMaker, uiMaker, onSave);
        this.isVertical = true;
        uiMaker.isVertical = true;
    }
    override async RefreshList(view: GamifyLifeView): Promise<void> {
        const scrollTop = this.listDiv.scrollTop;
        this.listDiv.empty();
        if (this.isVertical) {
            this.listDiv.style.gridTemplateColumns = 'repeat(' + this.itemsPerLine + ', 1fr)';
        } else {
            this.listDiv.style.gridTemplateRows = 'repeat(' + this.itemsPerLine + ', 1fr)';
        }
        
        for (let i = 0; i < this.mainArray.length; i++) {
            if (!this.mainArray[i].categoryKeys.contains('Skill')) {
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
            if (ConceptService.GetConceptByName(view.life, '') !== undefined) {
                new Notice('Name the unnamed concept first!');
                return;
            }
            const newItem = await this.newObjMaker();
            mainArray.push(newItem);
            await this.onSave();
            view.OpenCorrectConceptEditor(newItem);
        });
    }
}