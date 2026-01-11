import { Concept } from "./concept";

export interface SubspaceReference {
    key: string;
    location: string;
}

/**
 * A space that can contain things, including other spaces
 */
export class ItemOrSpace extends Concept {
    override categoryKeys: string[] = ['Item or Space'];
    
    /**
     * Space that are located within this space
     */
    subspaces: SubspaceReference[] = [];
}