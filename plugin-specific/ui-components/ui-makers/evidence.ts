import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { GamifyLifeView } from "../gamify-life-view";
import { Evidence } from "plugin-specific/models/observation";
import { EvidenceType, evidenceTypes } from "plugin-specific/models/const";
import { HTMLHelper } from "ui-patterns/html-helper";
import { KeyValue } from "plugin-specific/models/key-value";
import { MediaKeySuggest } from "../suggest/media-key-suggest";
import { Concept } from "plugin-specific/models/concept";
import { ConceptSuggest } from "../suggest/concept-suggest";

export class EvidenceUIMaker extends ObjUIMaker<Evidence> {
    get root(): Concept | undefined {
        return <Concept | undefined> this.globalData;
    }
    set root(newRoot: Concept | undefined) {
        this.globalData = newRoot;
    }

    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: Evidence[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        const shiftButtonsDiv = itemDiv.createDiv(this.isVertical ? 'hbox' : 'vbox');

        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'left' : 'up', onRefresh);
        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'right' : 'down', onRefresh);
        
        const typeInput = itemDiv.createEl('select', { value: mainArray[index].sourceType } );
        const sourceKeyInputDiv = itemDiv.createDiv();
        this.MakeSourceKeyInput(view, sourceKeyInputDiv, mainArray, index);

        view.describableEditorMaker.MakeMediaListEditor(view, itemDiv.createDiv(), mainArray[index]);
        view.describableEditorMaker.MakeDescriptionEditor(view, itemDiv.createDiv(), mainArray[index]);

        this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);

        for (let i = 0; i < evidenceTypes.length; i++) {
            const et = evidenceTypes[i];
            typeInput.createEl('option', { text: et, value: et } );
        }

        view.registerDomEvent(typeInput, 'change', async () => {
            mainArray[index].sourceType = <EvidenceType> typeInput.value;
            this.MakeSourceKeyInput(view, sourceKeyInputDiv, mainArray, index);
            await onSave();
        });
    }

    protected MakeSourceKeyInput(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: Evidence[],
        index: number
    ) {
        div.empty();
        const evidence = mainArray[index];
        if (evidence.sourceType === 'Unknown') {
            evidence.source = null;
            HTMLHelper.CreateNewTextDiv(div, 'Source unknown');
            return;
        }
        if (evidence.source === null) {
            evidence.source = '';
        }
        const sourceInput = div.createEl('input', { type: 'text', value: evidence.source } );
        if (evidence.sourceType === 'Media') {
            const updateSource = async (kv: KeyValue<string>) => {
                mainArray[index].source = kv.key;
                await view.onSave();
            };
            new MediaKeySuggest(sourceInput, div.createDiv('hbox'), view.life, updateSource, view);
            return;
        }
        if (evidence.sourceType === 'Concept') {
            const updateSource = async (concept: Concept) => {
                mainArray[index].source = concept.name;
                await view.onSave();
            };
            sourceInput.value = evidence.source;
            new ConceptSuggest(sourceInput, view.life, this.root, view.app, updateSource);
            return;
        }
    }
}