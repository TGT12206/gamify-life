import { Skill, SkillHandler, SkillLevel } from 'base-classes/skill';
import { HTMLHelper } from 'html-helper';
import { SkillPathModal } from 'modals/skill-path-modal';
import { Notice, TFile, WorkspaceLeaf } from 'obsidian';
import { Self } from 'base-classes/observable';
import { ObservableView } from './observable-view';

export const VIEW_TYPE_SELF = 'self';
export const SELF_EXTENSION = 'self';

export class SelfView extends ObservableView {
    override observable: Self;
    skillDiv: HTMLDivElement;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_SELF;
    }

    override Display(data: string) {
        super.Display(data);

        this.skillDiv = this.mainDiv.createDiv('vbox gl-bordered gl-outer-container');
        
        this.DisplaySkills();
    }

    protected override ParseAndReassignData(data: string) {
        const plainObj = JSON.parse(data);
        this.observable = new Self();
        Object.assign(this.observable, plainObj);
    }

    /**
     * Creates a list editor for the skills that are being kept track of.
     */
    private DisplaySkills() {
        // includes weights for each one
        const div = this.skillDiv;
        div.empty();
        HTMLHelper.CreateNewTextDiv(div, 'My Skills');
        HTMLHelper.CreateListEditor(
            div.createDiv(), 'gl-outer-container', false,
            this, this.observable.skillPaths, () => { return ''; },
            (
                div: HTMLDivElement,
                index: number,
                refreshList: () => Promise<void>
            ) => {
                this.DisplaySkill(div, index, refreshList);
            }
        );
    }

    /**
     * Creates an editor for the path of a skill that is being kept track of.
     */
    private async DisplaySkill(
        div: HTMLDivElement,
        index: number,
        refreshList: () => Promise<void>
    ) {
        div.classList.add('gl-fit-content');
        div.classList.add('gl-outer-container');

        const shiftButtonsDiv = div.createDiv('hbox');

        const list = this.observable.skillPaths;
        let skillPath = list[index];
        if (list[index] === '') {
            list[index] = 'Unnamed Skill.skill';
            skillPath = 'Unnamed Skill.skill';
        }
        const tFile = this.vault.getFileByPath(skillPath);

        HTMLHelper.CreateShiftElementUpButton(shiftButtonsDiv, this, list, index, false, refreshList);
        HTMLHelper.CreateShiftElementDownButton(shiftButtonsDiv, this, list, index, false, refreshList);

        const buttonsDiv = div.createDiv('hbox');
        const open = buttonsDiv.createEl('button', { text: 'Open Link' } );
        const edit = buttonsDiv.createEl('button', { text: 'Edit Link' } );

        const skillNameDiv = HTMLHelper.CreateNewTextDiv(div, tFile ? tFile.basename : 'Unnamed Skill');
        
        const progressDiv = HTMLHelper.CreateNewTextDiv(div, '');

        const fetchProgress = async () => {
            try {
                const unitsEarned = await SkillHandler.CountUnits(this.app, skillPath);
                progressDiv.textContent = unitsEarned.units + ' ' + unitsEarned.unit.name;
            } catch {
                return;
            }
        }

        HTMLHelper.CreateDeleteButton(div, this, list, index, refreshList);

        const updateSkill = async (file: TFile) => {
            pathModal.close();
            skillPath = file.path;
            list[index] = file.path;
            skillNameDiv.textContent = file.basename;
            fetchProgress();
            this.requestSave();
        }

        const pathModal = new SkillPathModal(this.app, updateSkill);

        fetchProgress();

        this.registerDomEvent(edit, 'click', () => {
            pathModal.open();
        });
        this.registerDomEvent(open, 'click', async () => {
            const tFile = this.vault.getFileByPath(list[index]);
            if (tFile !== null) {
                new Notice('opening existing ' + list[index]);
                this.app.workspace.getLeaf('tab').openFile(tFile);
            } else {
                new Notice('making new ' + list[index]);
                const newSubskill = new Skill();
                newSubskill.parentSkillPath = this.file?.path;
                const newFile = await this.app.vault.create('Unnamed Skill.skill', JSON.stringify(newSubskill));
                this.app.workspace.getLeaf('tab').openFile(newFile);
            }
        });
    }
}
