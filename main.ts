import { Notice, Plugin } from 'obsidian';
import { Concept } from 'plugin-specific/models/concept';
import { BaseCategories } from 'plugin-specific/models/const';
import { KeyValue } from 'plugin-specific/models/key-value';
import { Life } from 'plugin-specific/models/life';
import { Moment } from 'plugin-specific/models/moment';
import { Observation } from 'plugin-specific/models/observation';
import { Quest } from 'plugin-specific/models/quest';
import { Rank, Skill, SkillUnit } from 'plugin-specific/models/skill';
import { GamifyLifeView, VIEW_TYPE_GAMIFY_LIFE } from 'plugin-specific/ui-components/gamify-life-view';

function CreateDefaultLife() {
	const defaultLife = new Life();
	BaseCategories.forEach((cat: string) => {
		defaultLife.categories.push(new KeyValue(cat, cat));
	});
	const self = new Concept();
	self.name = 'Self';
	defaultLife.concepts.push(self);
	return defaultLife;
}

export default class GamifyLife extends Plugin {

	public life: Life;

	async onload() {
		await this.loadPluginData();
		
		this.registerView(
            VIEW_TYPE_GAMIFY_LIFE,
            (leaf) => new GamifyLifeView(leaf, {
				life: this.life,
        		onSave: this.savePluginData.bind(this)
			})
        );

        this.addRibbonIcon('gamepad-2', 'Open Gamify Life View', () => {
            this.activateView();
        });
        this.addCommand({
            id: 'open-gamify-life-view',
            name: 'Open Gamify Life View',
            callback: () => {
                this.activateView();
            }
        });

		// this.registerEvent(this.app.vault.on('rename', async (file: TAbstractFile, oldPath: string) => {
		// 	if (file instanceof TFolder) {
		// 		return;
		// 	}
		// 	const tFile = <TFile> file;
		// 	const ext = tFile.extension;
		// 	if (ext === MOMENT_EXTENSION) {

		// 	} else if (ext === SKILL_EXTENSION) {
		// 		await SkillHandler.HandleSkillRename(this.app, oldPath, file.path);
		// 		await MomentHandler.HandleSkillRename(this.app, oldPath, file.path);
		// 	} else if (MediaPathModal.validFileTypes.contains(ext)) {
		// 		await SkillHandler.HandleMediaRename(this.app, oldPath, file.path);
		// 		await MomentHandler.HandleMediaRename(this.app, oldPath, file.path);
		// 	}
		// }));
		// this.registerEvent(this.app.vault.on('delete', async (file: TAbstractFile) => {
		// 	if (file instanceof TFolder) {
		// 		return;
		// 	}
		// 	const tFile = <TFile> file;
		// 	const ext = tFile.extension;
		// 	if (ext === MOMENT_EXTENSION) {

		// 	} else if (ext === SKILL_EXTENSION) {
		// 		await SkillHandler.HandleSkillDelete(this.app, file.path);
		// 		await MomentHandler.HandleSkillDelete(this.app, file.path);
		// 	} else if (MediaPathModal.validFileTypes.contains(ext)) {
		// 		await SkillHandler.HandleMediaDelete(this.app, file.path);
		// 		await MomentHandler.HandleMediaDelete(this.app, file.path);
		// 	}
		// }));
	}

	onunload() {
		this.savePluginData();
	}

	async activateView() {
		const { workspace } = this.app;

		const leaves = workspace.getLeavesOfType(VIEW_TYPE_GAMIFY_LIFE);
		let leaf;

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getLeaf('tab');
			if (leaf === null) {
				new Notice("Failed to create view: workspace leaf was null");
				return;
			}
			await leaf.setViewState({ type: VIEW_TYPE_GAMIFY_LIFE, active: true });
		}
		workspace.setActiveLeaf(leaf);
		workspace.revealLeaf(leaf);
	}

	async loadPluginData() {
        const loadedData = await this.loadData();
		this.life = Object.assign(new Life(), loadedData);
		if (this.life.categories.length === 0) {
			this.life = CreateDefaultLife();
		}
		for (let i = 0; i < this.life.concepts.length; i++) {
			const concept = this.life.concepts[i];
			if (concept.categoryKeys.contains('Skill')) {
		        this.life.concepts[i] = Object.assign(new Skill(), concept);
			} else if (concept.categoryKeys.contains('Skill Rank')) {
		        this.life.concepts[i] = Object.assign(new Rank(), concept);
			} else if (concept.categoryKeys.contains('Skill Unit')) {
		        this.life.concepts[i] = Object.assign(new SkillUnit(), concept);
			} else if (concept.categoryKeys.contains('Moment')) {
				const moment = Object.assign(new Moment(), concept);
		        this.life.concepts[i] = moment;
                moment.startTime = new Date(moment.startTime);
                moment.endTime = new Date(moment.endTime);
			} else if (concept.categoryKeys.contains('Observation')) {
		        this.life.concepts[i] = Object.assign(new Observation(), concept);
			} else if (concept.categoryKeys.contains('Quest')) {
				const quest = Object.assign(new Quest(), concept);
		        this.life.concepts[i] = quest;
                quest.initialDate = new Date(quest.initialDate);
			}
        }
		this.life.concepts.sort((a, b) => { return a.name.toLowerCase() === b.name.toLowerCase() ? 0 : a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1 });
    }

	async savePluginData() {
        await this.saveData(this.life);
    }
}