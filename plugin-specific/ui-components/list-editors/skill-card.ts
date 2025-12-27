import { Concept } from "plugin-specific/models/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { GridEditor } from "ui-patterns/grid-editor";
import { SkillCardUIMaker } from "../ui-makers/skill-card";
import { Skill } from "plugin-specific/models/skill";
import { GamifyLifeView } from "../gamify-life-view";
import { KeyService } from "plugin-specific/services/key";
import { Notice, setIcon } from "obsidian";

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
    override async RefreshList(view: GamifyLifeView): Promise<void> {
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