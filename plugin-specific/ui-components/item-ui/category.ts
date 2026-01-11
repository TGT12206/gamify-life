import { baseCategories } from "plugin-specific/models/const";
import { GamifyLifeView } from "../gamify-life-view";
import { MapEntryUI } from "ui-patterns/map-entry-ui";

export class CategoryUI extends MapEntryUI<string, string> {
    override async Render(
        view: GamifyLifeView,
        div: HTMLDivElement,
        mainMap: Map<string, string>,
        itemAccess: { key: string },
        onRefresh: (() => Promise<void>),
        onSave: (() => Promise<void>) | null
    ): Promise<void> {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-div');
        
        const key = itemAccess.key;
        if (baseCategories.some(bc => bc === key)) div.classList.add('gl-bordered');
        
        const input = div.createEl('input', { type: 'text' } );
        this.MakeDeleteButton(view, div, mainMap, itemAccess, onRefresh);

        input.value = mainMap.get(key) ?? '';
        view.registerDomEvent(input, 'change', async () => {
            mainMap.set(key, input.value);
            await onRefresh();
        });
    }
}