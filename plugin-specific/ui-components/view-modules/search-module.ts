import { Life } from "plugin-specific/models/life";
import { GamifyLifeView } from "../gamify-life-view";
import { HTMLHelper } from "ui-patterns/html-helper";
import { Concept } from "plugin-specific/models/concept";
import { ItemView, Notice, setIcon } from "obsidian";
import { ListEditor } from "ui-patterns/list-editor";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { ConceptService } from "plugin-specific/services/concept";
import { GridEditor } from "ui-patterns/grid-editor";
import { KeyValue } from "plugin-specific/models/key-value";

export function DisplaySearchModule(view: GamifyLifeView, life: Life, div: HTMLDivElement) {
    div.className = 'gl-scroll gl-fill gl-outer-div vbox';
    
    const searchDiv = div.createDiv('gl-outer-div vbox');
    const resultsDiv = div.createDiv('gl-outer-div vbox');
    
    const searchInfo = new SearchContext(life);
    const resultsSection = new SearchCardGridEditor(
        searchInfo, resultsDiv, life.concepts, view.onSave
    );

    DisplaySearchBar(view, searchDiv, searchInfo, resultsSection);

    resultsSection.Render(view);
}

function DisplaySearchBar(view: GamifyLifeView, div: HTMLDivElement, context: SearchContext, resultsSection: SearchCardGridEditor) {
    div.className = 'gl-outer-div gl-bordered vbox';
    
    const searchRow = div.createDiv('gl-outer-div hbox');
    const filterRow = div.createDiv('gl-outer-div hbox');

    const searchTermInput = searchRow.createEl('input', { type: 'text', value: '' } );
    searchTermInput.className = 'gl-fill';

    const doSearch = async () => { await resultsSection.RefreshList(view) };

    const categoryCheckboxMaker = new CategoryCheckboxMaker();
    const categoryPicker = new ListEditor(
        context,
        filterRow.createDiv('gl-outer-div hbox'),
        context.life.categories,
        () => { return new KeyValue<string>('', '') },
        categoryCheckboxMaker,
        doSearch
    );

    HTMLHelper.CreateNewTextDiv(filterRow, 'Reverse order: ');
    const reverse = filterRow.createEl('input', { type: 'checkbox' } );
    reverse.checked = false;

    categoryCheckboxMaker.isVertical = false;
    categoryPicker.isVertical = false;
    categoryPicker.enableAddButton = false;

    categoryPicker.Render(view);

    view.registerDomEvent(searchTermInput, 'input', async () => {
        context.searchTerm = searchTermInput.value;
        await doSearch();
    });
    view.registerDomEvent(reverse, 'click', async () => {
        context.isReversed = reverse.checked;
        await doSearch();
    });
}

class CategoryCheckboxMaker extends ObjUIMaker<KeyValue<string>> {
    get context(): SearchContext {
        return <SearchContext> this.globalData;
    }
    set context(newContext: SearchContext) {
        this.globalData = newContext;
    }
    override async MakeUI(
        view: ItemView,
        itemDiv: HTMLDivElement,
        mainArray: KeyValue<string>[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void> {
        HTMLHelper.CreateNewTextDiv(itemDiv, mainArray[index].value);
        const checkbox = itemDiv.createEl('input', { type: 'checkbox' } );
        checkbox.checked = false;
        view.registerDomEvent(checkbox, 'click', async () => {
            const shouldAdd = checkbox.checked;
            if (shouldAdd) {
                this.context.categories.push(mainArray[index].value);
            } else {
                this.context.categories.remove(mainArray[index].value);
            }
            await onSave();
        });
    }
}

class SearchContext {
    life: Life;
    searchResults: number[];
    searchTerm: string;
    categories: string[];
    isReversed: boolean = false;
    constructor(
        life: Life,
        searchTerm: string = '',
        categories: string[] = []
    ) {
        this.life = life;
        this.searchResults = [];
        for (let i = 0; i < life.concepts.length; i++) {
            this.searchResults.push(i);
        }
        this.searchTerm = searchTerm;
        this.categories = categories;
    }
}

function SearchForResults(context: SearchContext) {
    context.searchResults = [];
    
    const term = context.searchTerm.toLowerCase();
    const hasCategories = context.categories.length > 0;

    if (context.isReversed) {
        for (let i = context.life.concepts.length - 1; i >= 0; i--) {
            CheckOneResult(context, i, term, hasCategories);
        }
    } else {
        for (let i = 0; i < context.life.concepts.length; i++) {
            CheckOneResult(context, i, term, hasCategories);
        }
    }
}

function CheckOneResult(context: SearchContext, i: number, term: string, hasCategories: boolean) {
    const concept = context.life.concepts[i];
    if (hasCategories) {
        const matchesCategory = context.categories.every(catKey =>
            concept.categoryKeys.includes(catKey)
        );
        if (!matchesCategory) return;
    }
    if (term !== '') {
        const inKey = context.life.concepts[i].name.toLowerCase().includes(term);
        const inName = concept.name.toLowerCase().includes(term);
        const inDescription = concept.description.toLowerCase().includes(term);
        const inAliases = concept.aliases.some(alias =>
            alias.toLowerCase().includes(term)
        );

        if (!(inKey || inName || inDescription || inAliases)) {
            return;
        }
    }

    context.searchResults.push(i);
}

export class SearchCardUIMaker extends ObjUIMaker<Concept> {
    get context(): SearchContext {
        return <SearchContext> this.globalData;
    }
    set context(newContext: SearchContext) {
        this.globalData = newContext;
    }
    get life(): Life {
        return this.context.life;
    }
    set life(newLife: Life) {
        this.context.life = newLife;
    }
    get searchResults(): number[] {
        return this.context.searchResults;
    }

    constructor(context: SearchContext) {
        super();
        this.context = context;
    }

    override MakeDeleteButton(
        view: ItemView,
        div: HTMLDivElement,
        mainArray: Concept[],
        index: number,
        onRefresh: () => Promise<void>
    ) {
        const deleteButton = div.createEl('button');
        deleteButton.className = 'gl-fit-content remove-button';
        setIcon(deleteButton, 'trash-2');
        view.registerDomEvent(deleteButton, 'click', async () => {
            ConceptService.DeleteConcept(this.life, index);
            await onRefresh();
        });
    }

    override async MakeUI(
        view: GamifyLifeView,
        itemDiv: HTMLDivElement,
        mainArray: Concept[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ) {
        itemDiv.classList.add('gl-fill');
        itemDiv.classList.add('gl-outer-div');
        itemDiv.classList.add('gl-bordered');

        this.MakeEditButton(view, itemDiv, mainArray, index);
        if (mainArray[index].name === 'Self') {
            HTMLHelper.CreateNewTextDiv(itemDiv, 'Name: Self');
        } else {
            HTMLHelper.CreateNewTextDiv(itemDiv, 'Name');
            const nameInput = itemDiv.createEl('input', {
                type: 'text',
                value: mainArray[index].name
            });
            view.registerDomEvent(nameInput, 'change', async () => {
                if (ConceptService.GetConceptByName(this.life, nameInput.value) === undefined) {
                    ConceptService.ChangeConceptName(this.life, mainArray[index], nameInput.value);
                    await onRefresh();
                } else {
                    nameInput.value = mainArray[index].name;
                    new Notice('That name has already been used!');
                }
            });
            this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);
        }
    }

    private MakeEditButton(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: Concept[],
        index: number
    ) {
        const editButton = div.createEl('button', { cls: 'gl-fit-content' } );
        setIcon(editButton, 'pencil-line');
        view.registerDomEvent(editButton, 'click', () => {
            view.OpenCorrectConceptEditor(mainArray[index]);
        });
    }
}

export class SearchCardGridEditor extends GridEditor<Concept> {
    get context(): SearchContext {
        return <SearchContext> this.globalData;
    }
    set context(newContext: SearchContext) {
        this.globalData = newContext;
    }
    get life(): Life {
        return this.context.life;
    }
    set life(newLife: Life) {
        this.context.life = newLife;
    }
    get searchResults(): number[] {
        return this.context.searchResults;
    }
    constructor(
        context: SearchContext,
        parentDiv: HTMLDivElement,
        mainArray: Concept[],
        onSave: () => Promise<void>
    ) {
        const uiMaker = new SearchCardUIMaker(context);
        super(context, parentDiv, mainArray, () => { return new Concept() } , uiMaker, onSave);
        this.context = context;
        this.isVertical = true;
        uiMaker.isVertical = true;
    }
    public override async RefreshList(view: ItemView): Promise<void> {
        SearchForResults(this.context);
        const scrollTop = this.listDiv.scrollTop;
        this.listDiv.empty();
        if (this.isVertical) {
            this.listDiv.style.gridTemplateColumns = 'repeat(' + this.itemsPerLine + ', 1fr)';
        } else {
            this.listDiv.style.gridTemplateRows = 'repeat(' + this.itemsPerLine + ', 1fr)';
        }
        
        for (let i = 0; i < this.context.searchResults.length; i++) {
            const itemContainer = this.listDiv.createDiv('gl-outer-div gl-scroll ' + (this.objUIMaker.isVertical ? 'vbox' : 'hbox'));
            await this.objUIMaker.MakeUI(
                view,
                itemContainer,
                this.mainArray,
                this.context.searchResults[i],
                this.onSave,
                async () => {
                    await this.onSave();
                    await this.RefreshList(view);
                }
            );
        }
        this.listDiv.scrollTop = scrollTop;
    }
    protected override CreateAddButton(view: ItemView): void {
        const mainArray = this.mainArray;
        const anchor = this.parentDiv.createDiv('gl-pos-anchor');
        const addButton = anchor.createEl('button');
        setIcon(addButton, 'plus');
        addButton.id = 'gl-grid-add-button';

        view.registerDomEvent(addButton, 'click', async () => {
            if (ConceptService.GetConceptByName(this.life, '') !== undefined) {
                new Notice('Name the empty entry first!');
                return;
            }
            const newItem = await this.newObjMaker();
            mainArray.push(newItem);
            await this.onSave();
            await this.RefreshList(view);
        });
    }
}