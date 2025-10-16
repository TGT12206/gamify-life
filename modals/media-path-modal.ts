import {App, FuzzySuggestModal, Notice, TFile} from 'obsidian';

export class MediaPathModal extends FuzzySuggestModal<TFile> {

    static imageFileTypes: string[] = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'avif', 'heic', 'ico'
    ];

    static videoFileTypes: string[] = [
        'mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v', 'flv', 'mpg', 'mpeg'
    ];

    static audioFileTypes: string[] = [
        'mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'aiff', 'wma'
    ];

    static isImage(extension: string) {
        return MediaPathModal.imageFileTypes.contains(extension);
    }
    static isVideo(extension: string) {
        return MediaPathModal.videoFileTypes.contains(extension);
    }
    static isAudio(extension: string) {
        return MediaPathModal.audioFileTypes.contains(extension);
    }

    associatedMediaDiv: HTMLDivElement;
    onSubmit: (file: TFile) => Promise<void>;

    constructor(app: App, associatedMediaDiv: HTMLDivElement, onSubmit: (file: TFile) => Promise<void>) {
        super(app);
        this.associatedMediaDiv = associatedMediaDiv;
        this.onSubmit = onSubmit;
    }

    private get vault() {
        return this.app.vault;
    }
    getItems(): TFile[] {
        const allFiles = this.vault.getFiles();
        for (let i = allFiles.length - 1; i >= 0; i--) {
            const currFile = allFiles[i];
            if (!(
                MediaPathModal.isImage(currFile.extension) ||
                MediaPathModal.isVideo(currFile.extension) ||
                MediaPathModal.isAudio(currFile.extension))
            ) {
                allFiles.splice(i, 1);
            }
        }
        return allFiles;
    }

    getItemText(file: TFile): string {
        return file.path;
    }

    onChooseItem(file: TFile, evt: MouseEvent | KeyboardEvent) {
        const asyncSubmit = async () => {
            await this.fetchMediaFileFromPath(file.path);
            await this.onSubmit(file);
        }
        asyncSubmit();
    }

    async fetchMediaFileFromPath(path: string) {
        this.associatedMediaDiv.empty();

        const tFile = this.vault.getFileByPath(path);
        if (tFile === null) {
            return;
        }
        const extension = tFile.extension;
        let mediaEl;
        if (MediaPathModal.isImage(extension)) {
            mediaEl = this.associatedMediaDiv.createEl('img');
        } else if (MediaPathModal.isVideo(extension)) {
            mediaEl = this.associatedMediaDiv.createEl('video');
        } else {
            mediaEl = this.associatedMediaDiv.createEl('audio');
        }
        mediaEl.className = 'gl-media';
        const arrayBuffer = await this.vault.readBinary(tFile);
        const blob = new Blob([arrayBuffer]);
        const mediaUrl = URL.createObjectURL(blob);
        mediaEl.src = mediaUrl;
    }
}