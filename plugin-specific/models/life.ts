import { Concept } from "./concept";

export class Life {
    categories: Map<string, string>;
    concepts: Map<string, Concept>;
    
    FindKey(concept: Concept): string | undefined {
        const entry = [...this.concepts.entries()].find(e => e[1] === concept);
        if (entry === undefined) {
            return undefined;
        }
        return entry[0];
    }

    /**
     * Deletes the category from the plugin, propagating the change
     */
    DeleteCategory(key: string): void {
        this.categories.delete(key);

        const concepts = [...this.concepts.values()];
        for (let i = 0; i < concepts.length; i++) {
            concepts[i].RemoveCategoryFromSelf(key);
        }
    }

    /**
     * Changes the category key, propagating the change throughout the plugin
     */
    ChangeCategoryKey(oldKey: string, newKey: string): void {
        const referencedConcept = this.categories.get(oldKey);
        if (referencedConcept === undefined) return;

        this.categories.delete(oldKey);
        this.categories.set(newKey, referencedConcept);

        const concepts = [...this.concepts.values()];
        for (let i = 0; i < concepts.length; i++) {
            concepts[i].ChangeCategoryInSelf(oldKey, newKey);
        }
    }

    /**
     * Deletes the concept from the plugin, propagating the change
     */
    DeleteConcept(key: string): void {
        this.concepts.delete(key);

        const concepts = [...this.concepts.values()]
        for (let i = 0; i < concepts.length; i++) {
            concepts[i].RemoveConceptReferenceFromSelf(key);
        }
    }

    /**
     * Deletes the media path from the plugin, propagating the change
     */
    DeleteMediaPath(path: string): void {
        const concepts = [...this.concepts.values()];
        for (let i = 0; i < concepts.length; i++) {
            concepts[i].RemoveMediaPathFromSelf(path);
        }
    }

    /**
     * Propagates changes to a media file's path throughout the plugin
     */
    ChangeMediaPath(oldPath: string, newPath: string): void {
        const concepts = [...this.concepts.values()];
        for (let i = 0; i < concepts.length; i++) {
            concepts[i].ChangeMediaPathInSelf(oldPath, newPath);
        }
    }
}