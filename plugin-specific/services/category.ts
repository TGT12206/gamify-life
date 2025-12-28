import { Life } from "plugin-specific/models/life";
import { KeyService } from "./key";

export class CategoryService {
    /**
     * Deletes the category key from the plugin, propagating the change.
     * @param category either the key or the index of the category
     */
    static DeleteCategory(life: Life, category: number | string): void {
        let index: number;
        let keyToDelete: string;

        if (typeof category === 'number') {
            index = category;
            if (index < 0 || index >= life.categories.length) return;
            keyToDelete = life.categories[index].key;
        } else {
            keyToDelete = category;
            index = KeyService.FindKey(life.categories, keyToDelete);
        }

        life.categories.splice(index, 1);

        for (let i = 0; i < life.concepts.length; i++) {
            const concept = life.concepts[i];
            concept.categoryKeys = concept.categoryKeys.filter(mk => mk !== keyToDelete);
        }
    }
    /**
     * Changes the category key
     * @param category either the key or the index of the category
     */
    static ChangeCategoryKey(life: Life, category: number | string, newKey: string): void {
        let index: number;
        let keyToChange: string;
        
        if (typeof category === 'number') {
            index = category;
            if (index < 0 || index >= life.categories.length) return;
            keyToChange = life.categories[index].key;
        } else {
            keyToChange = category;
            index = KeyService.FindKey(life.categories, keyToChange);
            if (index < 0 || index >= life.categories.length) return;
        }

        life.categories[index].key = newKey;

        for (let i = 0; i < life.concepts.length; i++) {
            const concept = life.concepts[i];
            KeyService.ChangeKeyReference(concept.categoryKeys, keyToChange, newKey);
        }
    }
}