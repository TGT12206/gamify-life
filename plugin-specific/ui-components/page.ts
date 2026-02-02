import { GamifyLifeView } from "./gamify-life-view";

export class PageInstance {
    constructor(
        public pageType: string,
        public pageData: any
    ) {}
}

export abstract class PageLoader {
    abstract Load(view: GamifyLifeView, div: HTMLDivElement, pageData: any): void;
}