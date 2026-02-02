import { ItemView, setIcon, WorkspaceLeaf } from 'obsidian';
import { Life } from 'plugin-specific/models/life';
import { Concept } from 'plugin-specific/models/concept';
import { SelfLoader } from './concept-editors/self';
import { PersonLoader } from './concept-editors/person';
import { SkillLoader } from './concept-editors/skill';
import { RankLoader } from './concept-editors/rank';
import { UnitLoader } from './concept-editors/unit';
import { QuestLoader } from './concept-editors/quest';
import { ConceptLoader } from './concept-editors/concept';
import { MomentLoader } from './concept-editors/moment';
import { ClaimLoader } from './concept-editors/claim';
import { MediaRenderer } from 'ui-patterns/media-renderer';
import { ItemOrSpaceLoader } from './concept-editors/item-or-space';
import { SearchModuleLoader } from './module-page-loaders/search-module';
import { CategoryModuleLoader } from './module-page-loaders/category';
import { LogModuleLoader } from './module-page-loaders/log';
import { QuestModuleLoader } from './module-page-loaders/quest-module';
import { SelfModuleLoader } from './module-page-loaders/self-module';
import { PageLoader } from './page';
import { Tab } from './tab-handler';
import { EmptyPageLoader } from './empty-page';
import { TabButtonArrayEditor } from './list-editors/tab';

export const VIEW_TYPE_GAMIFY_LIFE = 'gamify-life';
const VIEW_DISPLAY_NAME = 'Gamify Life';

interface GamifyLifeViewContext {
    life: Life;
    mediaRenderer: MediaRenderer;
    onSave: () => Promise<void>;
}

export class GamifyLifeView extends ItemView {
    mainDiv: HTMLDivElement;
    tabDiv: HTMLDivElement;

    mediaRenderer: MediaRenderer;
    
    currentTabIndex: number = 0;
    // this.contentEl is just a placeholder, it gets replaced by the tab button ui
    tabs: { el: HTMLElement, data: Tab }[] = [{ el: this.contentEl, data: new Tab() }];

    pageLoaders: Record<string, PageLoader>;

    life: Life;
    onSave: () => Promise<void>;

    constructor(leaf: WorkspaceLeaf, context: GamifyLifeViewContext) {
        super(leaf);
        this.life = context.life;
        this.mediaRenderer = context.mediaRenderer;
        this.onSave = context.onSave;

        this.pageLoaders = {
            'Empty': new EmptyPageLoader(),
            'Self Module': new SelfModuleLoader(),
            'Quest Module': new QuestModuleLoader(),
            'Log Module': new LogModuleLoader(),
            'Category Module': new CategoryModuleLoader(),
            'Search Module': new SearchModuleLoader(),
            'Concept': new ConceptLoader(this.life),
            'Person': new PersonLoader(this.life),
            'Item or Space': new ItemOrSpaceLoader(this.life),
            'Self': new SelfLoader(this.life),
            'Skill': new SkillLoader(this.life),
            'Rank': new RankLoader(this.life),
            'Unit': new UnitLoader(this.life),
            'Moment': new MomentLoader(this.life),
            'Claim': new ClaimLoader(this.life),
            'Quest': new QuestLoader(this.life),
        }
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

        const layout = mainDiv.createDiv('gl-main gl-outer-div gl-bordered vbox');
        const sidebar = layout.createDiv('gl-tab-bar gl-outer-div gl-bordered hbox');
        const navbar = sidebar.createDiv('gl-fit-content hbox');
        const contentArea = layout.createDiv('gl-fill vbox');
        this.tabDiv = contentArea;

        const backButton = navbar.createEl('button', { cls: 'gl-fit-content' } );
        const forwardsButton = navbar.createEl('button', { cls: 'gl-fit-content' } );

        setIcon(backButton, 'arrow-big-left');
        setIcon(forwardsButton, 'arrow-big-right');

        this.registerDomEvent(backButton, 'click', () => {
            this.activeTab.data.goBack(this);
        });
        this.registerDomEvent(forwardsButton, 'click', () => {
            this.activeTab.data.goForward(this);
        });

        new TabButtonArrayEditor(sidebar.createDiv(), this.tabs, this);
    }

    get activeTab() {
        return this.tabs[this.currentTabIndex];
    }

    setActiveTab = (newTabIndex: number) => {
        this.tabs.forEach(tab => tab.el.id = 'gl-unselected-tab');
        this.currentTabIndex = newTabIndex;
        this.activeTab.el.id = 'gl-selected-tab';
        this.activeTab.data.loadCurrentPage(this);
    };

    OpenCorrectConceptLoader(concept: Concept) {
        this.activeTab.data.loadNewPage('Concept', this, concept);
    }
}