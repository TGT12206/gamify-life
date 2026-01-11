import { ItemView, setIcon } from "obsidian";

export abstract class MapEntryUI<K, V> {
    globalData: any;
    isVertical: boolean = false;
    abstract Render(
        view: ItemView,
        div: HTMLDivElement,
        mainMap: Map<K, V>,
        itemAccess: V | { key: K },
        onRefresh: (() => Promise<void>) | null,
        onSave: (() => Promise<void>) | null
    ): Promise<void>;

    protected IsItem(itemAccess: V | { key: K }): itemAccess is V {
        return itemAccess === null ||
            !(typeof itemAccess === "object" &&
            "key" in itemAccess);
    }

    protected MakeDeleteButton(
        view: ItemView,
        div: HTMLDivElement,
        mainMap: Map<K, V>,
        itemAccess: V | { key: K },
        onRefresh: () => Promise<void>
    ) {
        const deleteButton = div.createEl('button');
        deleteButton.className = 'gl-fit-content remove-button';
        setIcon(deleteButton, 'trash-2');
        view.registerDomEvent(deleteButton, 'click', async () => {
            if (this.IsItem(itemAccess)) {
                const entry = [...mainMap.entries()].find(entry => entry[1] === itemAccess);
                const key = entry === undefined ? undefined : entry[0];
                if (key !== undefined) {
                    mainMap.delete(key);
                }
            } else {
                mainMap.delete(itemAccess.key);
            }
            await onRefresh();
        });
    }
}