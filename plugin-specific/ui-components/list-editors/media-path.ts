import { ArrayEditor } from "ui-patterns/array-editor";
import { GamifyLifeView } from "../gamify-life-view";
import { MediaPathUI } from "../item-ui/media-path";

export class MediaPathArrayEditor extends ArrayEditor<string> {
    constructor(div: HTMLDivElement, paths: string[], view: GamifyLifeView) {
        const itemUI = new MediaPathUI();
        super(div, paths, itemUI);
        
        this.makeNewItem = () => '';
        this.onSave = view.onSave;

        this.simpleDisplayOrder = (a, b) => {
            const partsA = a.split('/');
            const partsB = b.split('/');
            for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
                if (partsA[i] !== partsB[i]) {
                    const isFolderA = i < partsA.length - 1;
                    const isFolderB = i < partsB.length - 1;

                    if (isFolderA !== isFolderB) {
                        return isFolderA ? -1 : 1;
                    }

                    return partsA[i].localeCompare(partsB[i], undefined, { numeric: true });
                }
            }

            return partsA.length - partsB.length;
        };
        
        this.isVertical = false;
        this.itemsPerLine = 1;
        this.enableAddButton = true;
        this.indexedBased = true;

        itemUI.isVertical = false;

        this.Render(view);
    }
}