import { App, normalizePath, Notice, TFile, Vault } from "obsidian";
import { MOMENT_EXTENSION } from "views/moment-view";
import { Moment } from "./moment";
import { SKILL_EXTENSION, SkillView, VIEW_TYPE_SKILL } from "views/skill-view";

export class Skill {
    name: string = 'Unnamed Skill';
    parentSkillPath: string | undefined = undefined;
    description: string;
    mediaPaths: string[] = [];
    levels: SkillLevel[] = [];
    subskills: { path: string, weight: number }[] = [];
    unitType: SkillUnit = new SkillUnit();
}
export class SkillLevel {
    name: string = 'Master';
    threshold: number = 10000;
    mediaPath: string = '';
}
export class SkillUnit {
    name: string = 'Hours Spent';
    isHoursSpent: boolean = true;
}
export class GainedSkillUnit {
    skillPath: string = '';
    unitsGained: number;
}
export class SkillHandler {
    static async CountUnits(app: App, skillPath: string) {
        const vault = app.vault;

        const tFile = vault.getFileByPath(skillPath);
        if (tFile === null) {
            return 0;
        }
        const data = await vault.cachedRead(tFile);
        const skill = <Skill> JSON.parse(data);
        const formattedSkill = { skill: skill, path: skillPath, weight: 1 };
        const subskills: { skill: Skill, path: string, weight: number }[] = [ formattedSkill ];
        this.GetAllSubskills(formattedSkill, vault, subskills);

		const momentFiles = vault.getFiles();
		for (let i = momentFiles.length - 1; i >= 0; i--) {
			if (momentFiles[i].extension !== MOMENT_EXTENSION) {
				momentFiles.splice(i, 1);
			}
		}

        let units = 0;
		for (let i = 0; i < momentFiles.length; i++) {
			const data = await vault.cachedRead(momentFiles[i]);
			const moment = <Moment> JSON.parse(data);
			for (let j = 0; j < moment.skillUnitsGained.length; j++) {
                const skillUnitGained = moment.skillUnitsGained[j]
				const skillPathInMoment = skillUnitGained.skillPath;
				let foundSkill = false;
                for (let k = 0; !foundSkill && k < subskills.length; k++) {
                    const subskill = subskills[k];
                    if (skillPathInMoment === subskill.path) {
                        foundSkill = true;
                        units += skillUnitGained.unitsGained * subskill.weight;
				    }
                }
			}
		}
        return units;
    }

    private static async GetAllSubskills(skill: { skill: Skill, path: string, weight: number }, vault: Vault, subskillList: { skill: Skill, path: string, weight: number }[]) {
        for (let i = 0; i < skill.skill.subskills.length; i++) {
            const subskillDTO = skill.skill.subskills[i];
            const tFile = vault.getFileByPath(subskillDTO.path);
            if (tFile === null) {
                continue;
            }
			const data = await vault.cachedRead(tFile);
			const subskill = <Skill> JSON.parse(data);
            subskillList.push( { skill: subskill, path: subskillDTO.path, weight: subskillDTO.weight * skill.weight } );
        }
    }

    static async GetAllSkillFilesInVault(app: App): Promise<TFile[]> {
        const output: TFile[] = [];

        const allFiles = app.vault.getFiles();

        for (let i = 0; i < allFiles.length; i++) {
            if (allFiles[i].extension === SKILL_EXTENSION) {
                output.push(allFiles[i]);
            }
        }

        return output;
    }

    /**
     * Responsible for looping through all skill files in the vault and finding
     * links to the renamed skill and changing the link
     */
    static async HandleSkillRename(app: App, oldPath: string, newPath: string) {
		const openSkillViews = app.workspace.getLeavesOfType(VIEW_TYPE_SKILL);
        const allSkillFiles = await this.GetAllSkillFilesInVault(app);
        
        for (let i = 0; i < allSkillFiles.length; i++) {
            const currentSkillFile = allSkillFiles[i];
            const data = await app.vault.cachedRead(currentSkillFile);
            const plainObj = JSON.parse(data);
            if (currentSkillFile.path === newPath) {
                plainObj.name = currentSkillFile.basename;
            } else if (plainObj.parentSkillPath === oldPath) {
                plainObj.parentSkillPath = newPath;
            } else {
                for (let j = 0; j < plainObj.subskills.length; j++) {
                    if (plainObj.subskills[j].path === oldPath) {
                        plainObj.subskills[j].path = newPath;
                    }
                }
            }
            await app.vault.adapter.write(currentSkillFile.path, JSON.stringify(plainObj));
        }
        for (let i = 0; i < openSkillViews.length; i++) {
            await openSkillViews[i].loadIfDeferred();
            const currView = <SkillView> openSkillViews[i].view;
            if (currView.file === null) {
                continue;
            }

            const data = await app.vault.cachedRead(currView.file);
            currView.Display(data);
        }
	}

    /**
     * Responsible for looping through all skill files in the vault and finding
     * links to the deleted skill and removing the link
     */
	static async HandleSkillDelete(app: App, oldPath: string) {
		const openSkillViews = app.workspace.getLeavesOfType(VIEW_TYPE_SKILL);
        const allSkillFiles = await this.GetAllSkillFilesInVault(app);
        
        for (let i = 0; i < allSkillFiles.length; i++) {
            const currentSkillFile = allSkillFiles[i];
            const data = await app.vault.cachedRead(currentSkillFile);
            const plainObj = JSON.parse(data);
            if (plainObj.parentSkillPath === oldPath) {
                delete plainObj.parentSkillPath;
                await app.vault.adapter.write(currentSkillFile.path, JSON.stringify(plainObj));
            } else {
                let didChange = false;
                for (let j = plainObj.subskills.length - 1; j >= 0; j--) {
                    if (plainObj.subskills[j].path === oldPath) {
                        didChange = true;
                        plainObj.subskills.splice(j, 1);
                    }
                }
                if (didChange) {
                    await app.vault.adapter.write(currentSkillFile.path, JSON.stringify(plainObj));
                }
            }
        }
        for (let i = 0; i < openSkillViews.length; i++) {
            await openSkillViews[i].loadIfDeferred();
            const currView = <SkillView> openSkillViews[i].view;
            if (currView.file === null) {
                continue;
            }

            const data = await app.vault.cachedRead(currView.file);
            currView.Display(data);
        }
	}

    /**
     * Responsible for looping through all skill files in the vault and finding
     * links to the renamed media and changing the link
     */
    static async HandleMediaRename(app: App, oldPath: string, newPath: string) {
		const openSkillViews = app.workspace.getLeavesOfType(VIEW_TYPE_SKILL);
        const allSkillFiles = await this.GetAllSkillFilesInVault(app);
        
        for (let i = 0; i < allSkillFiles.length; i++) {
            const currentSkillFile = allSkillFiles[i];
            const data = await app.vault.cachedRead(currentSkillFile);
            const plainObj = JSON.parse(data);
            for (let j = 0; j < plainObj.mediaPaths.length; j++) {
                if (plainObj.mediaPaths[j] === oldPath) {
                    plainObj.mediaPaths[j] = newPath;
                }
            }
            await app.vault.adapter.write(currentSkillFile.path, JSON.stringify(plainObj));
        }
        for (let i = 0; i < openSkillViews.length; i++) {
            await openSkillViews[i].loadIfDeferred();
            const currView = <SkillView> openSkillViews[i].view;
            if (currView.file === null) {
                continue;
            }

            const data = await app.vault.cachedRead(currView.file);
            currView.Display(data);
        }
	}

    /**
     * Responsible for looping through all skill files in the vault and finding
     * links to the deleted media and removing the link
     */
	static async HandleMediaDelete(app: App, oldPath: string) {
		const openSkillViews = app.workspace.getLeavesOfType(VIEW_TYPE_SKILL);
        const allSkillFiles = await this.GetAllSkillFilesInVault(app);
        
        for (let i = 0; i < allSkillFiles.length; i++) {
            const currentSkillFile = allSkillFiles[i];
            const data = await app.vault.cachedRead(currentSkillFile);
            const plainObj = JSON.parse(data);
            for (let j = plainObj.mediaPaths.length - 1; j >= 0; j--) {
                if (plainObj.mediaPaths[j] === oldPath) {
                    plainObj.mediaPaths.splice(j, 1);
                }
            }
            await app.vault.adapter.write(currentSkillFile.path, JSON.stringify(plainObj));
        }
        for (let i = 0; i < openSkillViews.length; i++) {
            await openSkillViews[i].loadIfDeferred();
            const currView = <SkillView> openSkillViews[i].view;
            if (currView.file === null) {
                continue;
            }

            const data = await app.vault.cachedRead(currView.file);
            currView.Display(data);
        }
	}
}