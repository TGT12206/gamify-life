import { ItemView, setIcon, WorkspaceLeaf } from 'obsidian';
import { Life } from 'plugin-specific/models/life';
import { DisplayMediaModule } from './view-modules/media-module';
import { DisplayCategoryModule } from './view-modules/category-module';
import { Concept } from 'plugin-specific/models/concept';
import { DisplaySearchModule } from './view-modules/search-module';
import { ConceptEditorUIMaker } from './concept-editors/concept';
import { SelfEditorUIMaker } from './concept-editors/self';
import { PersonEditorUIMaker } from './concept-editors/person';
import { SkillEditorUIMaker } from './concept-editors/skill';
import { RankEditorUIMaker } from './concept-editors/rank';
import { SkillUnitEditorUIMaker } from './concept-editors/skill-unit';
import { MomentEditorUIMaker } from './concept-editors/moment';
import { ObservationEditorUIMaker } from './concept-editors/observation';
import { QuestEditorUIMaker } from './concept-editors/quest';
import { DescribableEditorUIMaker } from './concept-editors/describable';
import { BaseCategories } from 'plugin-specific/models/const';
import { KeyService } from 'plugin-specific/services/key';
import { Moment } from 'plugin-specific/models/moment';
import { Observation } from 'plugin-specific/models/observation';
import { Quest } from 'plugin-specific/models/quest';
import { Skill } from 'plugin-specific/models/skill';
import { DisplaySelfModule } from './view-modules/self-module';
import { DisplayLogModule } from './view-modules/log-module';
import { DisplayQuestModule } from './view-modules/quest-module';

export const VIEW_TYPE_GAMIFY_LIFE = 'gamify-life';
const VIEW_DISPLAY_NAME = 'Gamify Life';

interface GamifyLifeViewContext {
    life: Life;
    onSave: () => Promise<void>;
}

export class GamifyLifeView extends ItemView {
    mainDiv: HTMLDivElement;
    moduleDiv: HTMLDivElement;

    describableEditorMaker: DescribableEditorUIMaker;
    conceptEditorMaker: ConceptEditorUIMaker;
    personEditorMaker: PersonEditorUIMaker;
    selfEditorMaker: SelfEditorUIMaker;
    skillEditorMaker: SkillEditorUIMaker;
    rankEditorMaker: RankEditorUIMaker;
    skillUnitEditorMaker: SkillUnitEditorUIMaker;
    momentEditorMaker: MomentEditorUIMaker;
    observationEditorMaker: ObservationEditorUIMaker;
    questEditorMaker: QuestEditorUIMaker;

    life: Life;
    onSave: () => Promise<void>;

    constructor(leaf: WorkspaceLeaf, context: GamifyLifeViewContext) {
        super(leaf);
        this.life = context.life;
        this.onSave = context.onSave;
        
        this.describableEditorMaker = new DescribableEditorUIMaker(this.life);
        this.conceptEditorMaker = new ConceptEditorUIMaker(this.life);
        this.personEditorMaker = new PersonEditorUIMaker(this.life);
        this.selfEditorMaker = new SelfEditorUIMaker(this.life);
        this.skillEditorMaker = new SkillEditorUIMaker(this.life);
        this.rankEditorMaker = new RankEditorUIMaker(this.life);
        this.skillUnitEditorMaker = new SkillUnitEditorUIMaker(this.life);
        this.momentEditorMaker = new MomentEditorUIMaker(this.life);
        this.observationEditorMaker = new ObservationEditorUIMaker(this.life);
        this.questEditorMaker = new QuestEditorUIMaker(this.life);
    }

    getViewType() {
        return VIEW_TYPE_GAMIFY_LIFE;
    }

    getDisplayText(): string {
        return VIEW_DISPLAY_NAME
    }

    clear(): void {
        return;
    }

    override async onOpen() {
        this.contentEl.empty();
        this.mainDiv = this.contentEl.createDiv('gl-main gl-outer-container vbox');

        const mainDiv = this.mainDiv;

        const layout = mainDiv.createDiv('gl-main gl-outer-div gl-bordered hbox');
        const sidebar = layout.createDiv('gl-tab-bar gl-outer-div gl-bordered vbox');
        this.moduleDiv = layout.createDiv('gl-fill gl-scroll');
        const contentArea = this.moduleDiv;

        const setActiveModule = (button: HTMLButtonElement, renderFn: () => void) => {
            sidebar.querySelectorAll('button').forEach(btn => btn.id = 'gl-unselected-tab');
            button.id = 'gl-selected-tab';
            contentArea.empty();
            renderFn();
        };

        const selfBtn = sidebar.createEl('button');
        setIcon(selfBtn, 'user');
        selfBtn.title = 'Player Data';
        this.registerDomEvent(selfBtn, 'click', () => {
            setActiveModule(selfBtn, () => {
                DisplaySelfModule(this, this.life, contentArea);
            })
        });

        const questBtn = sidebar.createEl('button');
        setIcon(questBtn, 'scroll-text');
        questBtn.title = 'Quests';
        this.registerDomEvent(questBtn, 'click', () => {
            setActiveModule(questBtn, () => {
                DisplayQuestModule(this, this.life, contentArea);
            })
        });

        const logBtn = sidebar.createEl('button');
        setIcon(logBtn, 'notebook-pen');
        logBtn.title = 'Log';
        this.registerDomEvent(logBtn, 'click', () => {
            setActiveModule(logBtn, () => {
                DisplayLogModule(this, this.life, contentArea);
            })
        });

        const mediaBtn = sidebar.createEl('button');
        setIcon(mediaBtn, 'image');
        mediaBtn.title = 'Gallery';
        this.registerDomEvent(mediaBtn, 'click', () => {
            setActiveModule(mediaBtn, () => {
                DisplayMediaModule(this, this.life, contentArea);
            })
        });

        const categoryBtn = sidebar.createEl('button');
        setIcon(categoryBtn, 'tag');
        categoryBtn.title = 'Categories';
        this.registerDomEvent(categoryBtn, 'click', () => {
            setActiveModule(categoryBtn, () => {
                DisplayCategoryModule(this, this.life, contentArea);
            })
        });

        const searchBtn = sidebar.createEl('button');
        setIcon(searchBtn, 'search');
        searchBtn.title = 'Search';
        this.registerDomEvent(searchBtn, 'click', () => {
            setActiveModule(searchBtn, () => {
                DisplaySearchModule(this, this.life, contentArea);
            })
        });

        selfBtn.click();
    }

    OpenCorrectConceptEditor(concept: Concept) {
        const div = this.moduleDiv;
        const conceptKV = this.life.concepts[KeyService.FindValue(this.life.concepts, concept)];
        if (conceptKV.key === 'Self') {
            return this.selfEditorMaker.MakeUI(this, div, conceptKV.value);
        }
        for (let i = 0; i < BaseCategories.length; i++) {
            const bc = BaseCategories[i];
            if (!concept.categoryKeys.contains(bc)) {
                continue;
            }
            switch(bc) {
                case 'Person':
                    return this.personEditorMaker.MakeUI(this, div, concept);
                case 'Skill':
                    return this.skillEditorMaker.MakeUI(this, div, <Skill> concept);
                case 'Skill Rank':
                    return this.rankEditorMaker.MakeUI(this, div, concept);
                case 'Skill Unit':
                    return this.skillUnitEditorMaker.MakeUI(this, div, concept);
                case 'Moment':
                    return this.momentEditorMaker.MakeUI(this, div, <Moment> concept);
                case 'Observation':
                    return this.observationEditorMaker.MakeUI(this, div, <Observation> concept);
                case 'Quest':
                    return this.questEditorMaker.MakeUI(this, div, <Quest> concept);
            }
        }
        return this.conceptEditorMaker.MakeUI(this, div, concept);
    }
}

export function DisplayComingSoon(div: HTMLDivElement) {
    div.empty();
    div.createEl('h2', { text: 'Coming soon!' });
    div.createEl('p', { text: 'This module is currently under development.' });
}