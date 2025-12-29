import { Notice, setIcon, Vault, View } from "obsidian";

export class MediaRenderer {
    
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

    static async renderMedia(mediaDiv: HTMLDivElement, view: View, path: string) {
        const vault = view.app.vault;
        mediaDiv.empty();
        const src = await this.getSrc(mediaDiv, vault, path);
        
        const extension = path.split('.').last();

        if (extension === undefined) {
            new Notice('No extension found in ' + path);
            throw new Error('No extension found in ' + path);
        }

        let mediaEl;
        if (this.isImage(extension)) {
            mediaEl = mediaDiv.createEl('img');
        } else if (this.isVideo(extension)) {
            mediaEl = mediaDiv.createEl('video');
            mediaEl.controls = true;
        } else {
            mediaEl = mediaDiv.createEl('audio');
            mediaEl.controls = true;
        }
        mediaEl.className = 'gl-media';
        mediaEl.src = src;

        const open = mediaDiv.createEl('button', { cls: 'gl-fit-content' } );
        setIcon(open, 'external-link');

        view.registerDomEvent(open, 'click', () => {
            const tFile = view.app.vault.getFileByPath(path);
            if (tFile === null) {
                return new Notice(path + ' not found');
            }
            view.app.workspace.getLeaf('tab').openFile(tFile);
        });
    }

    static async getSrc(mediaDiv: HTMLDivElement, vault: Vault, path: string) {
        mediaDiv.empty();
        const tFile = vault.getFileByPath(path);
        if (tFile === null) {
            new Notice('File not found at ' + path);
            throw new Error('File not found at ' + path);
        }
        const arrayBuffer = await vault.readBinary(tFile);
        const blob = new Blob([arrayBuffer]);
        return URL.createObjectURL(blob);
    }
}