import { Notice, setIcon, Vault, View } from "obsidian";

export class MediaRenderer {
    
    cache: Map<string, string>;

    constructor() {
        this.cache = new Map();
    }

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

    static isValid(extension: string) {
        return this.validFileTypes.contains(extension.toLowerCase());
    }
    static isImage(extension: string) {
        return this.imageFileTypes.contains(extension.toLowerCase());
    }
    static isVideo(extension: string) {
        return this.videoFileTypes.contains(extension.toLowerCase());
    }
    static isAudio(extension: string) {
        return this.audioFileTypes.contains(extension.toLowerCase());
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

    async renderMedia(mediaDiv: HTMLDivElement, view: View, path: string) {
        const vault = view.app.vault;
        mediaDiv.empty();
        const src = await this.getSrc(mediaDiv, vault, path);
        
        const extension = path.split('.').last();

        if (extension === undefined) {
            new Notice('No extension found in ' + path);
            throw new Error('No extension found in ' + path);
        }

        let mediaEl;
        if (MediaRenderer.isImage(extension)) {
            mediaEl = mediaDiv.createEl('img');
        } else if (MediaRenderer.isVideo(extension)) {
            mediaEl = mediaDiv.createEl('video');
            mediaEl.loop = true;
        } else {
            mediaEl = mediaDiv.createEl('audio');
            mediaEl.loop = true;
        }
        mediaEl.className = 'gl-media gl-bordered pointer-hover';
        mediaEl.src = src;

        // const open = mediaDiv.createEl('button', { cls: 'gl-fit-content' } );
        // setIcon(open, 'external-link');

        view.registerDomEvent(mediaEl, 'click', () => {
            const tFile = view.app.vault.getFileByPath(path);
            if (tFile === null) {
                return new Notice(path + ' not found');
            }
            view.app.workspace.getLeaf('tab').openFile(tFile);
        });
    }

    async getSrc(mediaDiv: HTMLDivElement, vault: Vault, path: string) {
        let url = this.cache.get(path);
        if (url !== undefined) return url;

        mediaDiv.empty();
        const tFile = vault.getFileByPath(path);
        if (tFile === null) {
            new Notice('File not found at ' + path);
            throw new Error('File not found at ' + path);
        }
        const arrayBuffer = await vault.readBinary(tFile);
        const blob = new Blob([arrayBuffer]);
        url = URL.createObjectURL(blob);
        this.cache.set(path, url);
        return url;
    }

    async changePath(oldPath: string, newPath: string) {
        const url = this.cache.get(oldPath);
        if (url === undefined) return;
        this.cache.delete(oldPath);
        this.cache.set(newPath, url);
    }

    async forgetPath(path: string) {
        this.cache.delete(path);
    }
}