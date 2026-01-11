import { GamifyLifeView } from "./gamify-life-view";

export class PageInstance {
    constructor(
        public pageData: any,
        public pageLoader: PageLoader
    ) {}
}

export abstract class PageLoader {
    abstract Load(view: GamifyLifeView, div: HTMLDivElement, pageData: any): void;
}