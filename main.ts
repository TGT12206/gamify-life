import { Notice, Plugin, TAbstractFile, TFile, TFolder } from 'obsidian';
import { Concept } from 'plugin-specific/models/concept';
import { baseCategories } from 'plugin-specific/models/const';
import { Life } from 'plugin-specific/models/life';
import { Moment } from 'plugin-specific/models/moment';
import { Claim } from 'plugin-specific/models/claim';
import { Quest } from 'plugin-specific/models/quest';
import { Rank, Skill, Unit } from 'plugin-specific/models/skill';
import { GamifyLifeView, VIEW_TYPE_GAMIFY_LIFE } from 'plugin-specific/ui-components/gamify-life-view';
import { MediaRenderer } from 'ui-patterns/media-renderer';
import { ItemOrSpace } from 'plugin-specific/models/item-or-space';

export default class GamifyLife extends Plugin {

	public life: Life;
	public mediaRenderer: MediaRenderer;

	async onload() {
		await this.loadPluginData();
		this.mediaRenderer = new MediaRenderer();
		
		this.registerView(
            VIEW_TYPE_GAMIFY_LIFE,
            (leaf) => new GamifyLifeView(leaf, {
				life: this.life,
				mediaRenderer: this.mediaRenderer,
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

		this.registerEvent(this.app.vault.on('rename', async (file: TAbstractFile, oldPath: string) => {
			if (file instanceof TFolder) {
				return;
			}
			const tFile = <TFile> file;
			const ext = tFile.extension;
			if (MediaRenderer.isValid(ext)) {
				this.life.ChangeMediaPath(oldPath, file.path);
			}
			await this.savePluginData()
		}));

		this.registerEvent(this.app.vault.on('delete', async (file: TAbstractFile) => {
			if (file instanceof TFolder) {
				return;
			}
			const tFile = <TFile> file;
			const ext = tFile.extension;
			if (MediaRenderer.isValid(ext)) {
				this.life.DeleteMediaPath(file.path);
			}
			await this.savePluginData()
		}));
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

	CreateDefaultLife() {
		const defaultLife = new Life();
		defaultLife.categories = new Map();
		defaultLife.concepts = new Map();
		baseCategories.forEach((cat: string) => {
			defaultLife.categories.set(cat, cat);
		});
		const self = new Concept();
		defaultLife.concepts.set('Self', self);
		return defaultLife;
	}

	async loadPluginData() {
        const loadedData = await this.loadData();
		this.life = Object.assign(new Life(), loadedData);
		if (this.life.categories === undefined || this.life.concepts === undefined) {
			this.life = this.CreateDefaultLife();
		} else {
			this.life.categories = new Map<string, string>(loadedData.categories);
			this.life.concepts = new Map<string, Concept>(loadedData.concepts);
		}
		this.rehydrateConcepts();
    }

	private getBaseTypeOfConceptObject(concept: Concept) {
		for (let i = 0; i < baseCategories.length; i++) {
			const bc = baseCategories[i];
			if (concept.categoryKeys.contains(bc)) {
				return bc;
			}
		}
		return undefined;
	}

	private rehydrateConcepts() {
		const conceptKeys = [...this.life.concepts.keys()];
		for (let i = 0; i < conceptKeys.length; i++) {
			const key = conceptKeys[i];
			const concept = <Concept> this.life.concepts.get(key);
			const bc = this.getBaseTypeOfConceptObject(concept);
			switch (bc) {
				case 'Person':
			        this.life.concepts.set(key, Object.assign(new ItemOrSpace(), concept));
					break;
				case 'Skill':
			        this.life.concepts.set(key, Object.assign(new Skill(), concept));
					break;
				case 'Rank':
			        this.life.concepts.set(key, Object.assign(new Rank(), concept));
					break;
				case 'Unit':
			        this.life.concepts.set(key, Object.assign(new Unit(), concept));
					break;
				case 'Moment':
					const moment = Object.assign(new Moment(), concept);
					this.life.concepts.set(key, moment);
					moment.startTime = new Date(moment.startTime);
					moment.endTime = new Date(moment.endTime);
					break;
				case 'Claim':
			        this.life.concepts.set(key, Object.assign(new Claim(), concept));
					break;
				case 'Quest':
					const quest = Object.assign(new Quest(), concept);
					this.life.concepts.set(key, quest);
					quest.initialDate = new Date(quest.initialDate);
					break;
				default:
					this.life.concepts.set(key, Object.assign(new Concept(), concept));
					break;
			}
        }
	}

	async savePluginData() {
		const lifeDTO = {
			categories: Array.from(this.life.categories.entries()),
			concepts: Array.from(this.life.concepts.entries())
		};

        await this.saveData(lifeDTO);
    }
}