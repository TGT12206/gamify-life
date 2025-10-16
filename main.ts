import { Skill } from 'base-classes/skill';
import { SkillView, SKILL_EXTENSION, VIEW_TYPE_SKILL } from 'views/skill-view';
import { Moment } from 'base-classes/moment';
import { MomentView, MOMENT_EXTENSION, VIEW_TYPE_MOMENT } from 'views/moment-view';
import { Notice, Plugin, View, WorkspaceLeaf } from 'obsidian';

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

	private handleRenames() {
		// if a parent skill is deleted, automatically go through all the subskills and remove the link to it
	}

	private handleDeletes() {
		// if a parent skill is renamed, automatically go through all the subskills and update the link to it
	}
}