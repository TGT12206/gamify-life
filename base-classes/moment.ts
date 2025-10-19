import { App, TFile } from "obsidian";
import { GainedSkillUnit } from "./skill";
import { MOMENT_EXTENSION, MomentView, VIEW_TYPE_MOMENT } from "views/moment-view";

export class Moment {
    startTime: Date = new Date();
    endTime: Date = new Date();
    mediaPaths: string[] = [];
    description: string = '';
    skillUnitsGained: GainedSkillUnit[] = [];
    taskPaths: string[] = []; // unused for now
    observablePaths: string[] = [];
}

export class MomentHandler {
    static async GetAllMomentFilesInVault(app: App): Promise<TFile[]> {
        const output: TFile[] = [];

        const allFiles = app.vault.getFiles();

        for (let i = 0; i < allFiles.length; i++) {
            if (allFiles[i].extension === MOMENT_EXTENSION) {
                output.push(allFiles[i]);
            }
        }

        return output;
    }

    /**
     * Responsible for looping through all moment files in the vault and finding
     * links to the renamed skill and changing the link
     */
    static async HandleSkillRename(app: App, oldPath: string, newPath: string) {
        const openMomentViews = app.workspace.getLeavesOfType(VIEW_TYPE_MOMENT);
        const allMomentFiles = await this.GetAllMomentFilesInVault(app);
        
        for (let i = 0; i < allMomentFiles.length; i++) {
            const currentMomentFile = allMomentFiles[i];
            const data = await app.vault.cachedRead(currentMomentFile);
            const plainObj = JSON.parse(data);
            let didChange = false;
            for (let j = 0; j < plainObj.skillUnitsGained.length; j++) {
                if (plainObj.skillUnitsGained[j].skillPath === oldPath) {
                    didChange = true;
                    plainObj.skillUnitsGained[j].skillPath = newPath;
                }
            }
            if (didChange) {
                await app.vault.adapter.write(currentMomentFile.path, JSON.stringify(plainObj));
            }
        }
        for (let i = 0; i < openMomentViews.length; i++) {
            await openMomentViews[i].loadIfDeferred();
            const currView = <MomentView> openMomentViews[i].view;
            if (currView.file === null) {
                continue;
            }

            const data = await app.vault.cachedRead(currView.file);
            currView.Display(data);
        }
    }

    /**
     * Responsible for looping through all moment files in the vault and finding
     * links to the deleted skill and removing the link
     */
    static async HandleSkillDelete(app: App, oldPath: string) {
        const openMomentViews = app.workspace.getLeavesOfType(VIEW_TYPE_MOMENT);
        const allMomentFiles = await this.GetAllMomentFilesInVault(app);
        
        for (let i = 0; i < allMomentFiles.length; i++) {
            const currentMomentFile = allMomentFiles[i];
            const data = await app.vault.cachedRead(currentMomentFile);
            const plainObj = JSON.parse(data);
            let didChange = false;
            for (let j = 0; j < plainObj.skillUnitsGained.length; j++) {
                if (plainObj.skillUnitsGained[j].skillPath === oldPath) {
                    didChange = true;
                    delete plainObj.skillUnitsGained[j].skillPath;
                }
            }
            if (didChange) {
                await app.vault.adapter.write(currentMomentFile.path, JSON.stringify(plainObj));
            }
        }
        for (let i = 0; i < openMomentViews.length; i++) {
            await openMomentViews[i].loadIfDeferred();
            const currView = <MomentView> openMomentViews[i].view;
            if (currView.file === null) {
                continue;
            }

            const data = await app.vault.cachedRead(currView.file);
            currView.Display(data);
        }
    }
    
    /**
     * Responsible for looping through all moment files in the vault and finding
     * links to the renamed media and changing the link
     */
    static async HandleMediaRename(app: App, oldPath: string, newPath: string) {
        const openMomentViews = app.workspace.getLeavesOfType(VIEW_TYPE_MOMENT);
        const allMomentFiles = await this.GetAllMomentFilesInVault(app);
        
        for (let i = 0; i < allMomentFiles.length; i++) {
            const currentMomentFile = allMomentFiles[i];
            const data = await app.vault.cachedRead(currentMomentFile);
            const plainObj = JSON.parse(data);
            for (let j = 0; j < plainObj.mediaPaths.length; j++) {
                if (plainObj.mediaPaths[j] === oldPath) {
                    plainObj.mediaPaths[j] = newPath;
                }
            }
            await app.vault.adapter.write(currentMomentFile.path, JSON.stringify(plainObj));
        }
        for (let i = 0; i < openMomentViews.length; i++) {
            await openMomentViews[i].loadIfDeferred();
            const currView = <MomentView> openMomentViews[i].view;
            if (currView.file === null) {
                continue;
            }

            const data = await app.vault.cachedRead(currView.file);
            currView.Display(data);
        }
    }

    /**
     * Responsible for looping through all moment files in the vault and finding
     * links to the deleted media and removing the link
     */
    static async HandleMediaDelete(app: App, oldPath: string) {
        const openMomentViews = app.workspace.getLeavesOfType(VIEW_TYPE_MOMENT);
        const allMomentFiles = await this.GetAllMomentFilesInVault(app);
        
        for (let i = 0; i < allMomentFiles.length; i++) {
            const currentMomentFile = allMomentFiles[i];
            const data = await app.vault.cachedRead(currentMomentFile);
            const plainObj = JSON.parse(data);
            for (let j = plainObj.mediaPaths.length - 1; j >= 0; j--) {
                if (plainObj.mediaPaths[j] === oldPath) {
                    plainObj.mediaPaths.splice(j, 1);
                }
            }
            await app.vault.adapter.write(currentMomentFile.path, JSON.stringify(plainObj));
        }
        for (let i = 0; i < openMomentViews.length; i++) {
            await openMomentViews[i].loadIfDeferred();
            const currView = <MomentView> openMomentViews[i].view;
            if (currView.file === null) {
                continue;
            }

            const data = await app.vault.cachedRead(currView.file);
            currView.Display(data);
        }
    }
}