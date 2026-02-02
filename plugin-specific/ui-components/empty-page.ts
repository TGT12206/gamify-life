import { setIcon } from "obsidian";
import { GamifyLifeView } from "./gamify-life-view";
import { PageLoader } from "./page";
import { LogModuleLoader } from "./module-page-loaders/log";
import { SearchContext } from "./list-editors/search-card";

export class EmptyPageLoader extends PageLoader {
    Load(view: GamifyLifeView, div: HTMLDivElement): void {
        div.empty();
        div.className = 'vbox grid gl-outer-div';
        div.style.setProperty('--num-rows', 'repeat(3, 1fr)');

        const createModuleButton = (icon: string, title: string, onClick: () => void | Promise<void>) => {
            const btn = div.createEl('button');
            setIcon(btn, icon);
            btn.title = title;
            btn.classList.add('gl-bordered');
            btn.id = 'gl-unselected-tab';
            view.registerDomEvent(btn, 'click', onClick);
        }

        createModuleButton('user', 'Player Data', () => {
            view.activeTab.data.loadNewPage('Self Module', view, null);
        });
        createModuleButton('scroll-text', 'Quests', () => {
            view.activeTab.data.loadNewPage('Quest Module', view, null);
        });
        createModuleButton('notebook-pen', 'Log', () => {
            const data = (<LogModuleLoader> view.pageLoaders['Log Module']).CreateDefaultMoment();
            view.activeTab.data.loadNewPage('Log Module', view, data);
        });
        createModuleButton('tag', 'Categories', () => {
            view.activeTab.data.loadNewPage('Category Module', view, null);
        });
        createModuleButton('search', 'Search', () => {
            const data = new SearchContext(view.life);
            view.activeTab.data.loadNewPage('Search Module', view, data);
        });
    }
}