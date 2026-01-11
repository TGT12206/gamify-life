import { ArrayItemUI } from "ui-patterns/array-item-ui";
import { GamifyLifeView } from "../gamify-life-view";
import { Evidence } from "plugin-specific/models/claim";
import { EvidenceType, evidenceTypes } from "plugin-specific/models/const";
import { HTMLHelper } from "ui-patterns/html-helper";
import { Concept } from "plugin-specific/models/concept";
import { ConceptKeySuggest } from "../suggest/concept-key-suggest";
import { MediaPathSuggest } from "../suggest/media-path-suggest";
import { TFile } from "obsidian";
import { EvidenceTypeSuggest } from "../suggest/evidence-type-suggest";
import { MapEntry } from "ui-patterns/map-editor";

export class EvidenceUI extends ArrayItemUI<Evidence> {
    get root(): Concept | null {
        return <Concept | null> this.globalData;
    }
    set root(newRoot: Concept | null) {
        this.globalData = newRoot;
    }

    constructor(root: Concept | null) {
        super();
        this.root = root;
    }

    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: Evidence[],
        itemAccess: Evidence,
        onRefresh: () => Promise<void>,
        onSave: () => Promise<void>
    ): Promise<void> {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-div');

        this.MakeSupportStrengthEditor(view, div.createDiv(), itemAccess, onRefresh);
        this.MakeExplanationEditor(view, div.createDiv(), itemAccess);
        
        const typeInput = div.createEl('input', { type: 'text', value: itemAccess.sourceType } );
        const sourceKeyInputDiv = div.createDiv();
        this.MakeSourceKeyInput(view, sourceKeyInputDiv, itemAccess);

        this.MakeDeleteButton(view, div, mainArray, itemAccess, onRefresh);

        for (let i = 0; i < evidenceTypes.length; i++) {
            const et = evidenceTypes[i];
            typeInput.createEl('option', { text: et, value: et } );
        }

        const selectEvidenceType = async () => {
            itemAccess.sourceType = <EvidenceType> typeInput.value;
            this.MakeSourceKeyInput(view, sourceKeyInputDiv, itemAccess);
            await onSave();
        };
        new EvidenceTypeSuggest(typeInput, view.app, selectEvidenceType);
    }

    MakeSourceKeyInput(
        view: GamifyLifeView,
        div: HTMLDivElement,
        evidence: Evidence
    ) {
        div.empty();
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
            const selectSource = async (file: TFile) => {
                evidence.source = file.path;
                await view.onSave();
            };
            new MediaPathSuggest(sourceInput, div.createDiv('hbox'), selectSource, view);
            return;
        }
        if (evidence.sourceType === 'Concept') {
            const selectSource = async (entry: MapEntry<string, Concept>) => {
                evidence.source = entry.key;
                await view.onSave();
            };
            sourceInput.value = view.life.concepts.get(evidence.source)?.GetName(view.life) ?? evidence.source;
            new ConceptKeySuggest(sourceInput, view.life, this.root, view.app, selectSource);
            return;
        }
    }
    
    MakeExplanationEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        evidence: Evidence
    ) {
        div.empty();
        div.addClass('vbox');

        const input = div.createEl('textarea', {
            text: evidence.explanation
        });
        input.className = 'gl-fill';

        view.registerDomEvent(input, 'change', async () => {
            evidence.explanation = input.value;
            await view.onSave();
        });
    }
    
    MakeSupportStrengthEditor(
        view: GamifyLifeView,
        div: HTMLDivElement,
        evidence: Evidence,
        onRefresh: () => Promise<void>,
    ) {
        div.empty();
        div.addClass('hbox');

        HTMLHelper.CreateNewTextDiv(div, 'Support strength:');

        const input = div.createEl('input', {
            type: 'number',
            value: evidence.supportingStrength + ''
        });
        HTMLHelper.CreateNewTextDiv(div, '%');

        view.registerDomEvent(input, 'change', async () => {
            const newValue = parseFloat(input.value);
            evidence.supportingStrength = newValue;
            await onRefresh();
        })
    }
}