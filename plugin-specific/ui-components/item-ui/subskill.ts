import { Skill, SubskillReference } from "plugin-specific/models/skill";
import { GamifyLifeView } from "../gamify-life-view";
import { SubskillKeySuggest } from "../suggest/subskill-key-suggest";
import { ArrayItemUI } from "ui-patterns/array-item-ui";
import { MapEntry } from "ui-patterns/map-editor";

export class SubskillReferenceUI extends ArrayItemUI<SubskillReference> {
    get root(): Skill {
        return <Skill> this.globalData;
    }
    set root(newRoot: Skill) {
        this.globalData = newRoot;
    }

    constructor(root: Skill) {
        super();
        this.root = root;
    }

    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: SubskillReference[],
        reference: SubskillReference,
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-div');

        const keyInput = div.createEl('input', { type: 'text', value: reference.key } );
        const weightInput = div.createEl('input', { type: 'text', value: reference.key } );
        this.MakeDeleteButton(view, div, mainArray, reference, onRefresh);

        const selectKey = async (entry: MapEntry<string, Skill>) => {
            reference.key = entry.key;
            if (onSave !== null) await onSave();
        };
        new SubskillKeySuggest(keyInput, view.life, this.root, view.app, selectKey);

        view.registerDomEvent(weightInput, 'change', async () => {
            reference.weight = parseFloat(weightInput.value);
            if (onSave !== null) await onSave();
        });
    }
}