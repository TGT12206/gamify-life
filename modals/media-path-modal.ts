import {App, FuzzySuggestModal, Notice, TFile} from 'obsidian';

export class MediaPathModal extends FuzzySuggestModal<TFile> {

    static get validFileTypes() {
        const output: string[] = [];
        
        const imgTypes = this.imageFileTypes;
        const vidTypes = this.videoFileTypes;
        const audTypes = this.audioFileTypes;

        for (let i = 0; i < imgTypes.length; i++) {
            output.push(imgTypes[i]);
        }
        for (let i = 0; i < vidTypes.length; i++) {
            output.push(vidTypes[i]);
        }
        for (let i = 0; i < audTypes.length; i++) {
            output.push(audTypes[i]);
        }
        return output;
    }

    static get imageFileTypes() {
        return [
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'avif', 'heic', 'ico'
        ]
    };

    static get videoFileTypes() {
        return [
            'mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v', 'flv', 'mpg', 'mpeg'
        ]
    };

    static get audioFileTypes() {
        return [
            'mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'aiff', 'wma'
        ]
    };

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
            mediaEl.controls = true;
        } else {
            mediaEl = this.associatedMediaDiv.createEl('audio');
            mediaEl.controls = true;
        }
        mediaEl.className = 'gl-media';
        const arrayBuffer = await this.vault.readBinary(tFile);
        const blob = new Blob([arrayBuffer]);
        const mediaUrl = URL.createObjectURL(blob);
        mediaEl.src = mediaUrl;
    }
}