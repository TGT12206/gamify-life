import { Concept } from "plugin-specific/models/concept";
import { GamifyLifeView } from "../gamify-life-view";
import { GenerateUniqueStringKey, MapEditor, MapEntry } from "ui-patterns/map-editor";
import { prepareFuzzySearch } from "obsidian";
import { Life } from "plugin-specific/models/life";
import { SearchCardUI } from "../item-ui/search-card";

export class SearchContext {
    life: Life;
    searchResults: string[];
    searchTerm: string;
    categories: string[];
    isReversed: boolean = false;
    showImages: boolean = true;
    constructor(
        life: Life,
        searchTerm: string = '',
        categories: string[] = []
    ) {
        this.life = life;
        this.searchResults = [];
        const conceptKeys = [...life.concepts.keys()];
        for (let i = 0; i < conceptKeys.length; i++) {
            this.searchResults.push(conceptKeys[i]);
        }
        this.searchTerm = searchTerm;
        this.categories = categories;
    }
}

export class SearchCardGrid extends MapEditor<string, Concept> {
    get context(): SearchContext {
        return <SearchContext> this.globalData;
    }
    set context(newContext: SearchContext) {
        this.globalData = newContext;
    }

    constructor(context: SearchContext, div: HTMLDivElement, view: GamifyLifeView) {
        const itemUI = new SearchCardUI(context);
        super(div, view.life.concepts, itemUI);

        this.context = context;

        this.makeNewEntry = () => {
            const key = GenerateUniqueStringKey();
            const value = new Concept();
            return new MapEntry(key, value);
        };
        this.onSave = view.onSave;

        const checkCategory = (entry: MapEntry<string, Concept>) => {
            const actualCategories = entry.value.categoryKeys;
                for (const searchedCategory of context.categories) {
                    if (!actualCategories.includes(searchedCategory)) return false;
                }
                return true;
        }

        this.complexDisplayHandler = entries => {

            if (this.context.searchTerm === '') {
                return entries
                    .filter(entry => checkCategory(entry))
                    .sort((a, b) => Concept.alphabeticComparison(a.value, b.value, view.life))
            }

            const fuzzyMatcher = prepareFuzzySearch(this.context.searchTerm);
            return entries
            .filter(entry => checkCategory(entry))
            .map(entry => {
                const concept = entry.value;
                const description = concept.description;

                let stringRepresentation = '';
                for (let j = 0; j < concept.aliases.length; j++) {
                    stringRepresentation += concept.aliases[j] + '\n';
                }
                stringRepresentation += description;

                const matchData = fuzzyMatcher(stringRepresentation);

                return { entry: entry, matchData: matchData };
            })
            .filter(result => result.matchData)
            .sort((a, b) => (context.isReversed ? -1 : 1) * (b.matchData!.score - a.matchData!.score))
            .map(result => result.entry);
        };
        
        this.isVertical = true;
        this.itemsPerLine = 5;
        this.enableAddButton = true;
        this.keyBased = true;

        itemUI.isVertical = true;

        this.Render(view);
    }
}