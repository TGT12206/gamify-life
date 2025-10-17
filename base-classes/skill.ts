import { App, Vault } from "obsidian";
import { MOMENT_EXTENSION } from "views/moment-view";
import { Moment } from "./moment";

export class Skill {
    name: string;
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
}