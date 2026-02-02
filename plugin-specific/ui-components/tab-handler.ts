import { Concept } from "plugin-specific/models/concept";
import { GamifyLifeView } from "./gamify-life-view";
import { PageInstance } from "./page";
import { playerKey } from "plugin-specific/models/const";
import { ItemOrSpace } from "plugin-specific/models/item-or-space";
import { Rank, Skill, Unit } from "plugin-specific/models/skill";
import { Moment } from "plugin-specific/models/moment";
import { Claim } from "plugin-specific/models/claim";
import { Quest } from "plugin-specific/models/quest";

export class Tab {
    currentPageIndex: number = 0;
    pageHistory: PageInstance[] = [new PageInstance('Empty', null)];
    loadCurrentPage(view: GamifyLifeView) {
        const page = this.pageHistory[this.currentPageIndex];
        let type = page.pageType;
        if (page.pageType === 'Concept') {
            const conceptInfo = this.FindConceptKeyAndType(view, page.pageData);
            type = conceptInfo.type ?? 'Concept';
            page.pageData = this.ConvertConcept(view, page.pageData, conceptInfo.key, conceptInfo.type);
        }
        view.pageLoaders[type].Load(view, view.tabDiv, page.pageData);
    }
    loadNewPage(type: string, view: GamifyLifeView, pageData: any = null) {
        if (this.pageHistory.length > this.currentPageIndex) this.pageHistory.splice(this.currentPageIndex + 1);
        this.currentPageIndex++;
        this.pageHistory.push(new PageInstance(type, pageData));
        this.loadCurrentPage(view);
    }
    goBack(view: GamifyLifeView) {
        if (this.currentPageIndex === 0) return;
        this.currentPageIndex--;
        this.loadCurrentPage(view);
    }
    goForward(view: GamifyLifeView) {
        if (this.currentPageIndex >= this.pageHistory.length - 1) return;
        this.currentPageIndex++;
        this.loadCurrentPage(view);
    }

    private FindConceptKeyAndType(view: GamifyLifeView, concept: Concept) {
        const key = view.life.FindKey(concept);
        if (key === playerKey) return { key: key, type: 'Self' };
        return { key: key, type: concept.baseCategory };
    }

    private ConvertConcept(view: GamifyLifeView, concept: Concept, key: string | undefined, conceptType: string | undefined) {
        const concepts = view.life.concepts;
        let convertedConcept;
        switch(conceptType) {
            case 'Person':
            case undefined:
            default:
                convertedConcept = new Concept();
                break;
            case 'Item or Space':
                convertedConcept = new ItemOrSpace();
                break;
            case 'Skill':
                convertedConcept = new Skill();
                break;
            case 'Rank':
                convertedConcept = new Rank();
                break;
            case 'Unit':
                convertedConcept = new Unit();
                break;
            case 'Moment':
                convertedConcept = new Moment();
                break;
            case 'Claim':
                convertedConcept = new Claim();
                break;
            case 'Quest':
                convertedConcept = new Quest();
                break;
        }
        Object.assign(convertedConcept, concept);
        if (key !== undefined) concepts.set(key, convertedConcept);
        return convertedConcept;
    }
}