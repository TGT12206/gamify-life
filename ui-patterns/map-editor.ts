import { ItemView, setIcon } from 'obsidian';
import { MapEntryUI } from './map-entry-ui';

export class MapEntry<K, V> {
    constructor(
        public key: K,
        public value: V
    ) {}
}

export function GenerateUniqueStringKey(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Creates a visual representation of a map of items
 * Remember to set key based to true if using a primitive type
 */
export class MapEditor<K, V> {
    public globalData: any;
    
    public div: HTMLDivElement;
    protected mapDiv: HTMLDivElement;
    public mainMap: Map<K, V>;
    public itemUI: MapEntryUI<K, V>;
    public keyBased: boolean = true;
    public makeNewEntry: (() => (MapEntry<K, V> | Promise<MapEntry<K, V>>)) | null = null;
    public onSave: (() => Promise<void>) | null = null;

    public simpleDisplayFilter: ((entry: MapEntry<K, V>) => boolean) | null = null;
    public simpleDisplayOrder: ((a: MapEntry<K, V>, b: MapEntry<K, V>) => number) | null = null;
    public complexDisplayHandler: ((entries: MapEntry<K, V>[]) => Promise<MapEntry<K, V>[]> | MapEntry<K, V>[]) | null = null;

    public insertionHandler: ((mainMap: Map<K, V>) => Promise<void> | void) | null = null;

    public isVertical: boolean = true;
    public itemsPerLine: number = 1;
    public enableAddButton: boolean = false;
    public extraClasses: string = '';

    get isGrid(): boolean {
        return this.itemsPerLine > 1;
    }

    constructor(div: HTMLDivElement, mainMap: Map<K, V>, itemUI: MapEntryUI<K, V>) {
        this.div = div;
        this.mainMap = mainMap;
        this.itemUI = itemUI;
    }

    public async Render(view: ItemView) {
        const isGrid = this.isGrid;
        const classNames = (this.isVertical ? 'vbox' : 'hbox') + ' gl-wide gl-outer-div ' + this.extraClasses;

        this.div.empty();
        this.div.className = classNames;
        this.mapDiv = this.div.createDiv(classNames + (isGrid ? ' grid' : ''));

        if (this.enableAddButton) this.CreateAddButton(view);
        await this.RefreshMap(view);
    }

    public async RefreshMap(view: ItemView) {
        const scrollTop = this.mapDiv.scrollTop;
        this.mapDiv.empty();

        const isGrid = this.isGrid;
        if (this.isVertical) {
            if (isGrid) this.mapDiv.style.gridTemplateColumns = 'repeat(' + this.itemsPerLine + ', 1fr)';
        } else {
            if (isGrid) this.mapDiv.style.gridTemplateRows = 'repeat(' + this.itemsPerLine + ', 1fr)';
        }

        let displayedEntries = [...this.mainMap.entries()].map(e => new MapEntry(e[0], e[1]) );

        const shouldFilter = this.simpleDisplayFilter !== null;
        const shouldSort = this.simpleDisplayOrder !== null;
        const complexHandlerNeeded = this.complexDisplayHandler !== null;

        if (complexHandlerNeeded) {
            const handler = <(entries: MapEntry<K, V>[]) => Promise<MapEntry<K, V>[]> | MapEntry<K, V>[]> this.complexDisplayHandler;
            displayedEntries = await handler(displayedEntries);
        } else {
            if (shouldFilter) {
                const filter = <(entry: MapEntry<K, V>) => boolean> this.simpleDisplayFilter;
                displayedEntries = displayedEntries.filter(entry => filter(entry));
            }
            if (shouldSort) {
                const order = <(a: MapEntry<K, V>, b: MapEntry<K, V>) => number> this.simpleDisplayOrder;
                displayedEntries = displayedEntries.sort((a, b) => order(a, b));
            }
        }

        for (let i = 0; i < displayedEntries.length; i++) {
            const entry = displayedEntries[i];
            const itemContainer = this.mapDiv.createDiv('gl-outer-div gl-scroll ' + (this.itemUI.isVertical ? 'vbox' : 'hbox'));

            await this.itemUI.Render(
                view,
                itemContainer,
                this.mainMap,
                this.keyBased ? { key: entry.key } : entry.value,
                async () => {
                    if (this.onSave !== null) {
                        await this.onSave();
                    }
                    await this.RefreshMap(view);
                },
                this.onSave
            );
        }
        this.mapDiv.scrollTop = scrollTop;
    }

    protected CreateAddButton(view: ItemView) {
        const isGrid = this.isGrid;
        const div = this.div;

        const addButton = div.createEl('button', { cls: 'add-button' } );
        setIcon(addButton, 'plus');
        if (isGrid) addButton.classList.add('gl-floating');

        view.registerDomEvent(addButton, 'click', async () => {
            if (this.makeNewEntry === null) return;
            const newEntry = await this.makeNewEntry();

            if (this.insertionHandler === null) {
                this.mainMap.set(newEntry.key, newEntry.value);
            } else {
                await this.insertionHandler(this.mainMap);
            }

            if (this.onSave !== null) await this.onSave();
            await this.RefreshMap(view);
        });
    }
}