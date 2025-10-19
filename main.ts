import { Skill, SkillHandler } from 'base-classes/skill';
import { SkillView, SKILL_EXTENSION, VIEW_TYPE_SKILL } from 'views/skill-view';
import { Moment, MomentHandler } from 'base-classes/moment';
import { MomentView, MOMENT_EXTENSION, VIEW_TYPE_MOMENT } from 'views/moment-view';
import { Notice, Plugin, TAbstractFile, TFile, TFolder, View, WorkspaceLeaf } from 'obsidian';
import { MediaPathModal } from 'modals/media-path-modal';
import { OBSERVABLE_EXTENSION, ObservableView, VIEW_TYPE_OBSERVABLE } from 'views/observable-view';
import { SELF_EXTENSION, SelfView, VIEW_TYPE_SELF } from 'views/self-view';
import { Observable, Self } from 'base-classes/observable';
import { OBSERVATION_EXTENSION, ObservationView, VIEW_TYPE_OBSERVATION } from 'views/observation-view';
import { TASK_EXTENSION, TaskView, VIEW_TYPE_TASK } from 'views/task-view';

export default class GamifyLife extends Plugin {
	async onload() {
		this.addExtension(
			'Skill',
			'chart-column-increasing',
			SKILL_EXTENSION,
			VIEW_TYPE_SKILL,
			() => {
				return new Skill();
			},
			(leaf: WorkspaceLeaf) => {
				return new SkillView(leaf);
			}
		);

		this.addExtension(
			'Moment',
			'calendar-clock',
			MOMENT_EXTENSION,
			VIEW_TYPE_MOMENT,
			() => {
				return new Moment();
			},
			(leaf: WorkspaceLeaf) => {
				return new MomentView(leaf);
			}
		);

		this.addExtension(
			'Observation',
			'notebook-pen',
			OBSERVATION_EXTENSION,
			VIEW_TYPE_OBSERVATION,
			() => {
				return new Self();
			},
			(leaf: WorkspaceLeaf) => {
				return new ObservationView(leaf);
			}
		);

		this.addExtension(
			'Observable',
			'microscope',
			OBSERVABLE_EXTENSION,
			VIEW_TYPE_OBSERVABLE,
			() => {
				return new Observable();
			},
			(leaf: WorkspaceLeaf) => {
				return new ObservableView(leaf);
			}
		);

		this.addExtension(
			'Self',
			'user-round',
			SELF_EXTENSION,
			VIEW_TYPE_SELF,
			() => {
				return new Self();
			},
			(leaf: WorkspaceLeaf) => {
				return new SelfView(leaf);
			}
		);

		this.addExtension(
			'Task',
			'clipboard-list',
			TASK_EXTENSION,
			VIEW_TYPE_TASK,
			() => {
				return new Self();
			},
			(leaf: WorkspaceLeaf) => {
				return new TaskView(leaf);
			}
		);

		this.registerEvent(this.app.vault.on('rename', async (file: TAbstractFile, oldPath: string) => {
			if (file instanceof TFolder) {
				return;
			}
			const tFile = <TFile> file;
			const ext = tFile.extension;
			if (ext === MOMENT_EXTENSION) {

			} else if (ext === SKILL_EXTENSION) {
				await SkillHandler.HandleSkillRename(this.app, oldPath, file.path);
				await MomentHandler.HandleSkillRename(this.app, oldPath, file.path);
			} else if (MediaPathModal.validFileTypes.contains(ext)) {
				await SkillHandler.HandleMediaRename(this.app, oldPath, file.path);
				await MomentHandler.HandleMediaRename(this.app, oldPath, file.path);
			}
		}));
		this.registerEvent(this.app.vault.on('delete', async (file: TAbstractFile) => {
			if (file instanceof TFolder) {
				return;
			}
			const tFile = <TFile> file;
			const ext = tFile.extension;
			if (ext === MOMENT_EXTENSION) {

			} else if (ext === SKILL_EXTENSION) {
				await SkillHandler.HandleSkillDelete(this.app, file.path);
				await MomentHandler.HandleSkillDelete(this.app, file.path);
			} else if (MediaPathModal.validFileTypes.contains(ext)) {
				await SkillHandler.HandleMediaDelete(this.app, file.path);
				await MomentHandler.HandleMediaDelete(this.app, file.path);
			}
		}));
	}

	onunload() {
		
	}

	async activateView(view_type: string) {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;

		leaf = workspace.getLeaf('tab');
		if (leaf === null) {
			new Notice("Failed to create view: workspace leaf was null");
			return;
		}
		await leaf.setViewState({ type: view_type, active: true });

		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}

	private addExtension(name: string, iconName: string, extensionName: string, viewTypeName: string, newObjMaker: () => any, newViewMaker: (leaf: WorkspaceLeaf) => View) {
		this.registerView(viewTypeName, newViewMaker);
		this.registerExtensions([extensionName], viewTypeName);

		const upperCase = name.toUpperCase();
		const lowerCase = name.toLowerCase();
		const normalCase = upperCase.charAt(0) + lowerCase.substring(1);
		
		this.addCommand({
			id: 'new-' + lowerCase,
			name: 'Create new ' + normalCase,
			callback: async () => {
				const newFile = await this.app.vault.create('Unnamed.' + extensionName, JSON.stringify(newObjMaker()));
				this.app.workspace.getLeaf('tab').openFile(newFile);
			}
		});

		this.registerEvent(
            this.app.workspace.on('file-menu', (menu, file) => {
				menu.addItem((item) => {
					item.setTitle('New ' + normalCase)
						.setIcon(iconName)
						.onClick(async () => {
							const newFile = await this.app.vault.create((file.parent === null ? '' : file.parent.path + '/') + 'Unnamed ' + normalCase + '.' + viewTypeName, JSON.stringify(newObjMaker()));
							this.app.workspace.getLeaf('tab').openFile(newFile);
						});
				});
            })
        );
	}
}