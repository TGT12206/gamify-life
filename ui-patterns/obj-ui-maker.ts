import { ItemView, setIcon } from "obsidian";

export abstract class ObjUIMaker<T> {
    globalData: any;
    isVertical: boolean = false;
    abstract MakeUI(
        view: ItemView,
        itemDiv: HTMLDivElement,
        mainArray: T[],
        index: number,
        onSave: () => Promise<void>,
        onRefresh: () => Promise<void>
    ): Promise<void>;

    protected MakeDeleteButton(
        view: ItemView,
        div: HTMLDivElement,
        mainArray: T[],
        index: number,
        onRefresh: () => Promise<void>
    ) {
        const deleteButton = div.createEl('button');
        deleteButton.className = 'gl-fit-content remove-button';
        setIcon(deleteButton, 'trash-2');
        view.registerDomEvent(deleteButton, 'click', async () => {
            mainArray.splice(index, 1);
            await onRefresh();
        });
    }

    protected MakeShiftButton(
        view: ItemView,
        div: HTMLDivElement,
        mainArray: T[],
        index: number,
        direction: 'left' | 'right' | 'up' | 'down',
        onRefresh: () => Promise<void>
    ) {
        const shifToPrev = direction === 'left' || direction === 'up';
        const shiftedIndex = shifToPrev ? index - 1 : index + 1;

        const button = div.createEl('button');
        button.className = 'gl-fit-content';
        setIcon(button, 'arrow-big-' + direction);
        button.disabled = shiftedIndex < 0 || shiftedIndex >= mainArray.length;

        view.registerDomEvent(button, 'click', async () => {
            await this.moveItem(onRefresh, mainArray, index, shiftedIndex);
        });
    }

    private async moveItem(
        onRefresh: () => Promise<void>,
        mainArray: T[],
        oldIndex: number,
        newIndex: number
    ) {
        if (newIndex >= 0 && newIndex < mainArray.length) {
            const [movedItem] = mainArray.splice(oldIndex, 1);
            mainArray.splice(newIndex, 0, movedItem);
            await onRefresh();
        }
    }
}