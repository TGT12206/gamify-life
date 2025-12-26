import { Life } from "plugin-specific/models/life";
import { GamifyLifeView } from "../gamify-life-view";
import { HTMLHelper } from "ui-patterns/html-helper";
import { Concept } from "plugin-specific/models/concept";
import { KeyValue } from "plugin-specific/models/key-value";
import { KeyValueGridEditor } from "./module";
import { ItemView, Notice, setIcon } from "obsidian";
import { ListEditor } from "ui-patterns/list-editor";
import { ObjUIMaker } from "ui-patterns/obj-ui-maker";
import { KeyService } from "plugin-specific/services/key";
import { ConceptService } from "plugin-specific/services/concept";

export function DisplaySearchModule(view: GamifyLifeView, life: Life, div: HTMLDivElement) {
    div.className = 'gl-scroll gl-fill gl-outer-div vbox';
    
    const searchDiv = div.createDiv('gl-outer-div vbox');
    const resultsDiv = div.createDiv('gl-outer-div vbox');
    
    const searchInfo = new SearchContext(life);
    const resultsSection = new SearchConceptKVGridEditor(
        searchInfo, resultsDiv, life.concepts, view.onSave
    );

    DisplaySearchBar(view, searchDiv, searchInfo, resultsSection);

    resultsSection.Render(view);
}

function DisplaySearchBar(view: GamifyLifeView, div: HTMLDivElement, context: SearchContext, resultsSection: SearchConceptKVGridEditor) {
    div.className = 'gl-outer-div gl-bordered vbox';
    
    const searchRow = div.createDiv('gl-outer-div hbox');
    const filterRow = div.createDiv('gl-outer-div hbox');

    const searchTermInput = searchRow.createEl('input', { type: 'text', value: '' } );
    searchTermInput.className = 'gl-fill';

    const doSearch = async () => { await resultsSection.RefreshList(view) };

    const categoryCheckboxMaker = new CategoryCheckboxMaker();
    const categoryPicker = new ListEditor(
        context,
        filterRow,
        context.life.categories,
        () => { return new KeyValue<string>('', '') },
        categoryCheckboxMaker,
        doSearch
    );

    categoryCheckboxMaker.isVertical = false;
    categoryPicker.isVertical = false;
    categoryPicker.enableAddButton = false;

    categoryPicker.Render(view);

    view.registerDomEvent(searchTermInput, 'input', async () => {
        context.searchTerm = searchTermInput.value;
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

    for (let i = 0; i < context.life.concepts.length; i++) {
        const concept = context.life.concepts[i].value;
        if (hasCategories) {
            const matchesCategory = context.categories.every(catKey =>
                concept.categoryKeys.includes(catKey)
            );
            if (!matchesCategory) continue;
        }
        if (term !== '') {
            const inKey = context.life.concepts[i].key.toLowerCase().includes(term);
            const inName = concept.name.toLowerCase().includes(term);
            const inDescription = concept.description.toLowerCase().includes(term);
            const inAliases = concept.aliases.some(alias =>
                alias.toLowerCase().includes(term)
            );

            if (!(inKey || inName || inDescription || inAliases)) {
                continue;
            }
        }

        context.searchResults.push(i);
    }
}

export class SearchConceptKVUIMaker extends ObjUIMaker<KeyValue<Concept>> {
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

    private ChangeKey(
        index: number,
        newKey: string
    ) {
        const mainArray = this.life.concepts;
        const existingKeyIndex = KeyService.FindKey(mainArray, newKey);
        if (existingKeyIndex !== -1) {
            new Notice('This key is already registered!');
            throw new Error('This key is already registered!');
        }
        mainArray[index].key = newKey;
    }

    private async MakeKeyUI(
        view: ItemView,
        keyDiv: HTMLDivElement,
        index: number,
        onSave: () => Promise<void>
    ) {
        const mainArray = this.life.concepts;
        if (mainArray[index].key === 'Self') {
            return HTMLHelper.CreateNewTextDiv(keyDiv, 'Key: Self');
        }
        HTMLHelper.CreateNewTextDiv(keyDiv, 'Key');
        const keyInput = keyDiv.createEl('input', { type: 'text', value: mainArray[index].key } );
        view.registerDomEvent(keyInput, 'change', async () => {
            try {
                KeyService.CheckIfDuplicateKey(this.life.concepts, keyInput.value);
                this.ChangeKey(index, keyInput.value);
                await onSave();
            } catch {
                keyInput.value = mainArray[index].key;
            }
        });
    }

    private MakeConceptUI(
        view: ItemView,
        valueDiv: HTMLDivElement,
        index: number,
        onSave: () => Promise<void>
    ) {
        const mainArray = this.life.concepts;
        HTMLHelper.CreateNewTextDiv(valueDiv, 'Name');
        const nameInput = valueDiv.createEl('input', { type: 'text', value: mainArray[index].value.name } );
        view.registerDomEvent(nameInput, 'change', async () => {
            try {
                KeyService.CheckIfDuplicateValue(this.life.concepts, nameInput.value, (a, b) => { return a.name === b });
                this.life.concepts[index].value.name = nameInput.value;
                await onSave();
            } catch {
                nameInput.value = mainArray[index].value.name;
            }
        });
    }

    override MakeDeleteButton(
        view: ItemView,
        div: HTMLDivElement,
        mainArray: KeyValue<Concept>[],
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
        mainArray: KeyValue<Concept>[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ) {
        itemDiv.classList.add('gl-fit-content');
        itemDiv.classList.add('gl-outer-div');
        itemDiv.classList.add('gl-bordered');
        const topDiv = itemDiv.createDiv('gl-outer-div ' + (this.isVertical ? 'hbox' : 'vbox'));
        const shiftButtonsDiv = topDiv.createDiv(this.isVertical ? 'hbox' : 'vbox');
        this.MakeEditButton(view, topDiv, mainArray, index);

        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'left' : 'up', onRefresh);
        this.MakeShiftButton(view, shiftButtonsDiv, mainArray, index, this.isVertical ? 'right' : 'down', onRefresh);
        
        this.MakeKeyUI(view, itemDiv.createDiv('hbox gl-outer-div'), index, onSave);
        this.MakeConceptUI(view, itemDiv.createDiv('hbox gl-outer-div'), index, onSave);

        if (mainArray[index].key !== 'Self') {
            this.MakeDeleteButton(view, itemDiv, mainArray, index, onRefresh);
        }
    }

    private MakeEditButton(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainArray: KeyValue<Concept>[],
        index: number
    ) {
        const editButton = div.createEl('button');
        setIcon(editButton, 'pencil-line');
        view.registerDomEvent(editButton, 'click', () => {
            view.OpenCorrectConceptEditor(mainArray[index].value);
        });
    }
}

export class SearchConceptKVGridEditor extends KeyValueGridEditor<Concept> {
    get context(): SearchContext {
        return <SearchContext> this.globalData;
    }
    set context(newContext: SearchContext) {
        this.globalData = newContext;
    }
    override get life(): Life {
        return this.context.life;
    }
    override set life(newLife: Life) {
        this.context.life = newLife;
    }
    get searchResults(): number[] {
        return this.context.searchResults;
    }
    constructor(
        context: SearchContext,
        parentDiv: HTMLDivElement,
        mainArray: KeyValue<Concept>[],
        onSave: () => Promise<void>
    ) {
        const uiMaker = new SearchConceptKVUIMaker(context);
        super(context, parentDiv, mainArray, () => { return new KeyValue<Concept>('', new Concept()) } , uiMaker, onSave);
        this.context = context;
        this.defaultValue = new Concept();
        this.compareFunction = (a: Concept, b: Concept) => {
            return a.name === b.name;
        }
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
}