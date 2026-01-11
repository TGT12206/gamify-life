import { baseCategories, BaseCategory } from "./const";
import { Life } from "./life";

/**
 * A concept that can be described. It may also have multiple
 * names and belong to multiple categories
 */
export class Concept {
    /**
     * An array of the names for this concept
     */
    aliases: string[] = [];
    
    /**
     * Returns a human readable representation of the concept.
     * The parameter is necessary for subclasses
     */
    GetName(life: Life): string | undefined {
        return this.aliases.length > 0 ? this.aliases[0] : undefined;
    }
    
    /**
     * Returns a representation of the concept that includes
     * information likely to be searched for.
     * The parameter is necessary for subclasses
     */
    GetSearchRepresentation(life: Life): string | undefined {
        return this.GetName(life);
    }

    static alphabeticComparisonByKeys: (
        a: string,
        b: string,
        life: Life
    ) => number = (a, b, life) => {
        const ac = life.concepts.get(a); const bc = life.concepts.get(b);
        if (ac === undefined && bc === undefined) return 0;
        if (ac === undefined) return 1;
        if (bc === undefined) return -1;

        return this.alphabeticComparison(ac, bc, life);
    }

    static alphabeticComparison: (
        a: Concept,
        b: Concept,
        life: Life
    ) => number = (a, b, life) => {
        const an = a.GetName(life); const bn = b.GetName(life);
        if (an === undefined && bn === undefined) return 0;
        if (an === undefined) return 1;
        if (bn === undefined) return -1;

        return an.localeCompare(bn, undefined, { numeric: true })
    }

    /**
     * A description, which can be multiple lines
     */
    description: string = '';

    /**
     * An array of vault paths to relevant media files
     */
    mediaPaths: string[] = [];

    /**
     * An array of references to categories that this concept belongs to
     */
    categoryKeys: string[] = [];

    /**
     * Returns the base category of the concept, or undefined if there is none
     */
    get baseCategory(): BaseCategory | undefined {
        for (let i = 0; i < baseCategories.length; i++) {
            const bc = baseCategories[i];
            if (this.categoryKeys.contains(bc)) {
                return bc;
            }
        }
        return undefined;
    }

    /**
     * Deletes the category key from the concept
     */
    RemoveCategoryFromSelf(key: string) {
        this.categoryKeys = this.categoryKeys.filter(k => k !== key);
    }

    /**
     * Changes the category key within the concept
     */
    ChangeCategoryInSelf(oldKey: string, newKey: string) {
        const categories = this.categoryKeys;
        for (let i = 0; i < categories.length; i++) {
            if (categories[i] === oldKey) {
                categories[i] = newKey;
            }
        }
    }

    /**
     * Deletes the referenced concept from this concept
     */
    RemoveConceptReferenceFromSelf(key: string) {}

    /**
     * Deletes the referenced path from this concept
     */
    RemoveMediaPathFromSelf(path: string) {
        this.mediaPaths = this.mediaPaths.filter(mp => mp !== path);
    }

    /**
     * Changes the referenced media path from this concept
     */
    ChangeMediaPathInSelf(oldPath: string, newPath: string) {
        const mediaPaths = this.mediaPaths;
        for (let j = 0; j < mediaPaths.length; j++) {
            if (mediaPaths[j] === oldPath) {
                mediaPaths[j] = newPath;
            }
        }
    }
}