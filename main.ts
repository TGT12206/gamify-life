import { Skill } from 'base-classes/skill';
import { SkillView, SKILL_EXTENSION, VIEW_TYPE_SKILL } from 'views/skill-view';
import { Notice, Plugin, WorkspaceLeaf } from 'obsidian';

export default class GamifyLife extends Plugin {
	async onload() {

		this.registerView(
			VIEW_TYPE_SKILL,
			(leaf) => new SkillView(leaf)
		);

		this.registerExtensions([SKILL_EXTENSION], VIEW_TYPE_SKILL);

		this.addCommand({
			id: 'new-lang-dict',
			name: 'Create Language Dictionary',
			callback: async () => {
				const newFile = await this.app.vault.create('Unnamed.' + SKILL_EXTENSION, JSON.stringify(new Skill()));
				this.app.workspace.getLeaf('tab').openFile(newFile);
			}
		});

		this.registerEvent(
            this.app.workspace.on('file-menu', (menu, file) => {
				menu.addItem((item) => {
					item.setTitle('New Language Dictionary')
						.setIcon('book-type')
						.onClick(async () => {
							const newFile = await this.app.vault.create((file.parent === null ? '' : file.parent.path + '/') + 'Unnamed.' + VIEW_TYPE_SKILL, JSON.stringify(new Skill()));
							this.app.workspace.getLeaf('tab').openFile(newFile);
						});
				});
            })
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
}