import { GamifyLifeView } from "../gamify-life-view";
import { ArrayItemUI } from "ui-patterns/array-item-ui";
import { MapEntry } from "ui-patterns/map-editor";
import { ItemOrSpace, SubspaceReference } from "plugin-specific/models/item-or-space";
import { SubspaceKeySuggest } from "../suggest/subspace-key-suggest";

export class SubspaceReferenceUI extends ArrayItemUI<SubspaceReference> {
    get root(): ItemOrSpace {
        return <ItemOrSpace> this.globalData;
    }
    set root(newRoot: ItemOrSpace) {
        this.globalData = newRoot;
    }

    constructor(root: ItemOrSpace) {
        super();
        this.root = root;
    }

    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: SubspaceReference[],
        reference: SubspaceReference,
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-div');

        const keyInput = div.createEl('input', { type: 'text', value: reference.key } );
        const locationInput = div.createEl('textarea', { text: reference.location } );
        this.MakeDeleteButton(view, div, mainArray, reference, onRefresh);

        const selectKey = async (entry: MapEntry<string, ItemOrSpace>) => {
            reference.key = entry.key;
            if (onSave !== null) await onSave();
        };
        new SubspaceKeySuggest(keyInput, view.life, this.root, view.app, selectKey);

        view.registerDomEvent(locationInput, 'change', async () => {
            reference.location = locationInput.value;
            if (onSave !== null) await onSave();
        });
    }
}