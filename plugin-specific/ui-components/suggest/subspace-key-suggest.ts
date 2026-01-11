import { App } from 'obsidian';
import { Concept } from 'plugin-specific/models/concept';
import { Life } from 'plugin-specific/models/life';
import { ConceptKeySuggest } from './concept-key-suggest';
import { MapEntry } from 'ui-patterns/map-editor';
import { ItemOrSpace } from 'plugin-specific/models/item-or-space';

export class SubspaceKeySuggest extends ConceptKeySuggest {
    constructor(
        public inputEl: HTMLInputElement,
        public life: Life,
        public root: ItemOrSpace,
        app: App,
        public callback: (entry: MapEntry<string, ItemOrSpace>) => Promise<void> = async () => {}
    ) {
        super(inputEl, life, root, app, callback, ['Item or Space']);
    }

    protected override CheckCategories(concept: Concept) {
        return concept.baseCategory === 'Item or Space';
    }

    protected override CheckIfRecursive(concept: Concept) {
        if (concept === this.root) return true;

        const space = <ItemOrSpace> concept;

        for (let i = 0; i < space.subspaces.length; i++) {
            const subspaceKey = space.subspaces[i].key;
            const subspace = this.life.concepts.get(subspaceKey);
            
            if (subspace !== undefined) {
                if (this.CheckIfRecursive(subspace)) {
                    return true;
                }
            }
        }

        return false;
    }
}