import { GamifyLifeView } from "../gamify-life-view";
import { HTMLHelper } from "ui-patterns/html-helper";
import { SearchCardGrid, SearchContext } from "../list-editors/search-card";
import { MapEditor } from "ui-patterns/map-editor";
import { MapEntryUI } from "ui-patterns/map-entry-ui";
import { PageLoader } from "../page";

export class SearchModuleLoader extends PageLoader {
    Load(view: GamifyLifeView, div: HTMLDivElement, context: SearchContext): void {
        div.empty();
        div.className = 'gl-scroll gl-fill gl-outer-div vbox';
    
        const searchDiv = div.createDiv('gl-outer-div vbox');
        const resultsDiv = div.createDiv('gl-outer-div vbox');

        const resultsSection = new SearchCardGrid(
            context, resultsDiv, view
        );

        this.DisplaySearchBar(view, searchDiv, context, resultsSection);
    }
    DisplaySearchBar(view: GamifyLifeView, div: HTMLDivElement, context: SearchContext, resultsSection: SearchCardGrid) {
        div.className = 'gl-outer-div gl-bordered vbox';
        
        const searchRow = div.createDiv('gl-outer-div hbox');
        const filterRow = div.createDiv('gl-outer-div hbox');

        const searchTermInput = searchRow.createEl('input', { type: 'text', value: context.searchTerm } );
        searchTermInput.className = 'gl-fill';

        const doSearch = async () => { await resultsSection.RefreshMap(view) };

        const checkBoxUI = new CategoryCheckboxUI(context);
        const categoryPicker = new MapEditor(
            filterRow.createDiv('gl-outer-div hbox'),
            view.life.categories,
            checkBoxUI
        );
        categoryPicker.onSave = doSearch;

        HTMLHelper.CreateNewTextDiv(filterRow, 'Show images?');
        const showImages = filterRow.createEl('input', { type: 'checkbox' } );
        showImages.checked = true;

        HTMLHelper.CreateNewTextDiv(filterRow, 'Reverse order?');
        const reverse = filterRow.createEl('input', { type: 'checkbox' } );
        reverse.checked = false;

        checkBoxUI.isVertical = false;
        categoryPicker.isVertical = false;
        categoryPicker.enableAddButton = false;

        categoryPicker.Render(view);

        view.registerDomEvent(searchTermInput, 'input', async () => {
            context.searchTerm = searchTermInput.value;
            await doSearch();
        });
        view.registerDomEvent(showImages, 'click', async () => {
            context.showImages = showImages.checked;
            await doSearch();
        });
        view.registerDomEvent(reverse, 'click', async () => {
            context.isReversed = reverse.checked;
            await doSearch();
        });
    }
}

class CategoryCheckboxUI extends MapEntryUI<string, string> {
    get context(): SearchContext {
        return <SearchContext> this.globalData;
    }
    set context(newContext: SearchContext) {
        this.globalData = newContext;
    }
    constructor(context: SearchContext) {
        super();
        this.context = context;
    }
    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainMap: Map<string, string>,
        itemAccess: { key: string },
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        const key = itemAccess.key;
        HTMLHelper.CreateNewTextDiv(div, mainMap.get(key) ?? key);
        const checkbox = div.createEl('input', { type: 'checkbox' } );
        checkbox.checked = this.context.categories.includes(key);
        view.registerDomEvent(checkbox, 'click', async () => {
            const shouldAdd = checkbox.checked;
            if (shouldAdd) {
                this.context.categories.push(key);
            } else {
                this.context.categories.remove(key);
            }
            if (onSave !== null) await onSave();
        });
    }
}