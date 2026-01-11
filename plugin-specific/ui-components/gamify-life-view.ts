import { ItemView, setIcon, WorkspaceLeaf } from 'obsidian';
import { Life } from 'plugin-specific/models/life';
import { Concept } from 'plugin-specific/models/concept';
import { SelfLoader } from './concept-editors/self';
import { PersonLoader } from './concept-editors/person';
import { SkillLoader } from './concept-editors/skill';
import { RankLoader } from './concept-editors/rank';
import { UnitLoader } from './concept-editors/unit';
import { QuestLoader } from './concept-editors/quest';
import { Moment } from 'plugin-specific/models/moment';
import { Quest } from 'plugin-specific/models/quest';
import { Rank, Skill, Unit } from 'plugin-specific/models/skill';
import { ConceptLoader } from './concept-editors/concept';
import { MomentLoader } from './concept-editors/moment';
import { ClaimLoader } from './concept-editors/claim';
import { playerKey } from 'plugin-specific/models/const';
import { Claim } from 'plugin-specific/models/claim';
import { MediaRenderer } from 'ui-patterns/media-renderer';
import { ItemOrSpaceLoader } from './concept-editors/item-or-space';
import { ItemOrSpace } from 'plugin-specific/models/item-or-space';
import { SearchModuleLoader } from './module-page-loaders/search-module';
import { CategoryModuleLoader } from './module-page-loaders/category';
import { LogModuleLoader } from './module-page-loaders/log';
import { QuestModuleLoader } from './module-page-loaders/quest-module';
import { SelfModuleLoader } from './module-page-loaders/self-module';
import { PageInstance } from './page';

export const VIEW_TYPE_GAMIFY_LIFE = 'gamify-life';
const VIEW_DISPLAY_NAME = 'Gamify Life';

interface GamifyLifeViewContext {
    life: Life;
    mediaRenderer: MediaRenderer;
    onSave: () => Promise<void>;
}

export class GamifyLifeView extends ItemView {
    mainDiv: HTMLDivElement;
    moduleDiv: HTMLDivElement;

    mediaRenderer: MediaRenderer;
    
    pageIndex: number;
    pageHistory: PageInstance[];

    selfModule: SelfModuleLoader;
    questModule: QuestModuleLoader;
    logModule: LogModuleLoader;
    categoryModule: CategoryModuleLoader;
    searchModule: SearchModuleLoader;

    conceptLoader: ConceptLoader;
    personLoader: PersonLoader;
    spaceLoader: ItemOrSpaceLoader;
    selfLoader: SelfLoader;
    skillLoader: SkillLoader;
    rankLoader: RankLoader;
    unitLoader: UnitLoader;
    momentLoader: MomentLoader;
    claimLoader: ClaimLoader;
    questLoader: QuestLoader;

    life: Life;
    onSave: () => Promise<void>;

    constructor(leaf: WorkspaceLeaf, context: GamifyLifeViewContext) {
        super(leaf);
        this.life = context.life;
        this.mediaRenderer = context.mediaRenderer;
        this.onSave = context.onSave;
        
        this.pageIndex = 0;
        this.pageHistory = [];

        this.selfModule = new SelfModuleLoader();
        this.questModule = new QuestModuleLoader();
        this.logModule = new LogModuleLoader();
        this.categoryModule = new CategoryModuleLoader();
        this.searchModule = new SearchModuleLoader();

        this.conceptLoader = new ConceptLoader(this.life);
        this.personLoader = new PersonLoader(this.life);
        this.spaceLoader = new ItemOrSpaceLoader(this.life);
        this.selfLoader = new SelfLoader(this.life);
        this.skillLoader = new SkillLoader(this.life);
        this.rankLoader = new RankLoader(this.life);
        this.unitLoader = new UnitLoader(this.life);
        this.momentLoader = new MomentLoader(this.life);
        this.claimLoader = new ClaimLoader(this.life);
        this.questLoader = new QuestLoader(this.life);
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
        const navbar = sidebar.createDiv('gl-bordered gl-fit-content hbox');
        const contentArea = layout.createDiv('gl-fill vbox');
        this.moduleDiv = contentArea;

        const backButton = navbar.createEl('button', { cls: 'gl-fit-content' } );
        const forwardsButton = navbar.createEl('button', { cls: 'gl-fit-content' } );

        setIcon(backButton, 'arrow-big-left');
        setIcon(forwardsButton, 'arrow-big-right');

        this.registerDomEvent(backButton, 'click', () => {
            this.TraverseHistory('Backwards');
        });
        this.registerDomEvent(forwardsButton, 'click', () => {
            this.TraverseHistory('Forwards');
        });

        const setActiveModule = (button: HTMLButtonElement, loadFn: () => void) => {
            sidebar.querySelectorAll('button').forEach(btn => btn.id = 'gl-unselected-tab');
            button.id = 'gl-selected-tab';
            this.moduleDiv.empty();
            this.pageHistory = [];
            this.pageIndex = 0;
            loadFn();
        };

        const selfBtn = sidebar.createEl('button');
        setIcon(selfBtn, 'user');
        selfBtn.title = 'Player Data';
        this.registerDomEvent(selfBtn, 'click', () => {
            setActiveModule(selfBtn, () => {
                this.pageHistory.push(new PageInstance(null, this.selfModule));
                this.selfModule.Load(this, this.moduleDiv);
            })
        });

        const questBtn = sidebar.createEl('button');
        setIcon(questBtn, 'scroll-text');
        questBtn.title = 'Quests';
        this.registerDomEvent(questBtn, 'click', () => {
            setActiveModule(questBtn, () => {
                this.pageHistory.push(new PageInstance(null, this.questModule));
                this.questModule.Load(this, this.moduleDiv);
            })
        });

        const logBtn = sidebar.createEl('button');
        setIcon(logBtn, 'notebook-pen');
        logBtn.title = 'Log';
        this.registerDomEvent(logBtn, 'click', () => {
            setActiveModule(logBtn, () => {
                this.pageHistory.push(new PageInstance(null, this.logModule));
                this.logModule.Load(this, this.moduleDiv);
            })
        });

        const categoryBtn = sidebar.createEl('button');
        setIcon(categoryBtn, 'tag');
        categoryBtn.title = 'Categories';
        this.registerDomEvent(categoryBtn, 'click', () => {
            setActiveModule(categoryBtn, () => {
                this.pageHistory.push(new PageInstance(null, this.categoryModule));
                this.categoryModule.Load(this, this.moduleDiv);
            })
        });

        const searchBtn = sidebar.createEl('button');
        setIcon(searchBtn, 'search');
        searchBtn.title = 'Search';
        this.registerDomEvent(searchBtn, 'click', () => {
            setActiveModule(searchBtn, () => {
                this.pageHistory.push(new PageInstance(null, this.searchModule));
                this.searchModule.Load(this, this.moduleDiv);
            })
        });

        selfBtn.click();
    }

    TraverseHistory(direction: 'Backwards' | 'Forwards') {
        if (direction === 'Backwards') {
            if (this.pageIndex === 0) return;
            this.pageIndex--;
            const page = this.pageHistory[this.pageIndex];
            this.moduleDiv.empty();
            page.pageLoader.Load(this, this.moduleDiv, page.pageData);
        }
        if (direction === 'Forwards') {
            if (this.pageIndex >= this.pageHistory.length - 1) return;
            this.pageIndex++;
            const page = this.pageHistory[this.pageIndex];
            this.moduleDiv.empty();
            page.pageLoader.Load(this, this.moduleDiv, page.pageData);
        }
    }

    OpenCorrectConceptLoader(concept: Concept) {
        const div = this.moduleDiv;
        const concepts = this.life.concepts;
        const key = this.life.FindKey(concept);
        
        this.pageIndex++;
        if (this.pageIndex < this.pageHistory.length) this.pageHistory.splice(this.pageIndex);

        if (key === playerKey) {
            this.pageHistory.push(new PageInstance(concept, this.selfLoader));
            return this.selfLoader.Load(this, div, concept);
        }
        let newConcept;
        const bc = concept.baseCategory;
        switch(bc) {
            case 'Person':
                this.pageHistory.push(new PageInstance(concept, this.personLoader));
                return this.personLoader.Load(this, div, concept);
            case 'Item or Space':
                newConcept = new ItemOrSpace();
                Object.assign(newConcept, concept);
                concepts.set(<string> key, newConcept);
                this.pageHistory.push(new PageInstance(newConcept, this.spaceLoader));
                return this.spaceLoader.Load(this, div, newConcept);
            case 'Skill':
                newConcept = new Skill();
                Object.assign(newConcept, concept);
                concepts.set(<string> key, newConcept);
                this.pageHistory.push(new PageInstance(newConcept, this.skillLoader));
                return this.skillLoader.Load(this, div, newConcept);
            case 'Rank':
                newConcept = new Rank();
                Object.assign(newConcept, concept);
                concepts.set(<string> key, newConcept);
                this.pageHistory.push(new PageInstance(newConcept, this.rankLoader));
                return this.rankLoader.Load(this, div, newConcept);
            case 'Unit':
                newConcept = new Unit();
                Object.assign(newConcept, concept);
                concepts.set(<string> key, newConcept);
                this.pageHistory.push(new PageInstance(newConcept, this.unitLoader));
                return this.unitLoader.Load(this, div, newConcept);
            case 'Moment':
                newConcept = new Moment();
                Object.assign(newConcept, concept);
                concepts.set(<string> key, newConcept);
                this.pageHistory.push(new PageInstance(newConcept, this.momentLoader));
                return this.momentLoader.Load(this, div, <Moment> newConcept);
            case 'Claim':
                newConcept = new Claim();
                Object.assign(newConcept, concept);
                concepts.set(<string> key, newConcept);
                this.pageHistory.push(new PageInstance(newConcept, this.claimLoader));
                return this.claimLoader.Load(this, div, <Claim> newConcept);
            case 'Quest':
                newConcept = new Quest();
                Object.assign(newConcept, concept);
                concepts.set(<string> key, newConcept);
                this.pageHistory.push(new PageInstance(newConcept, this.questLoader));
                return this.questLoader.Load(this, div, <Quest> newConcept);
            case undefined:
            default:
                this.pageHistory.push(new PageInstance(concept, this.conceptLoader));
                return this.conceptLoader.Load(this, div, concept);
        }
    }
}

export function DisplayComingSoon(div: HTMLDivElement) {
    div.empty();
    div.createEl('h2', { text: 'Coming soon!' });
    div.createEl('p', { text: 'This module is currently under development.' });
}