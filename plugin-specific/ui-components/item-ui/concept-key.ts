import { ArrayItemUI } from "ui-patterns/array-item-ui";
import { GamifyLifeView } from "../gamify-life-view";
import { ConceptKeySuggest } from "../suggest/concept-key-suggest";
import { Concept } from "plugin-specific/models/concept";
import { MapEntry } from "ui-patterns/map-editor";

export class ConceptKeyUI extends ArrayItemUI<string> {
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
        mainArray: string[],
        itemAccess: { index: number },
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-div');

        const item = this.IsItem(itemAccess) ? itemAccess : mainArray[itemAccess.index];
        const life = view.life;
        const concepts = life.concepts;

        const input = div.createEl('input', { type: 'text', value: concepts.get(item)?.GetName(life) ?? item } );
        this.MakeDeleteButton(view, div, mainArray, itemAccess, onRefresh);

        const selectConcept = async (entry: MapEntry<string, Concept>) => {
            mainArray[itemAccess.index] = entry.key;
            if (onSave !== null) await onSave();
        };
        new ConceptKeySuggest(input, view.life, this.root, view.app, selectConcept);
    }
}