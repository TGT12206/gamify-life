import { Describable, Concept } from "./concept";
import { EvidenceType } from "./const";

export class Observation extends Concept {
    override categoryKeys: string[] = ['Observation'];
    
    /**
     * The concepts that this observation is about
     */
    conceptNames: string[] = [];
    
    /**
     * A list of sources to support this observation
     */
    evidenceList: Evidence[] = [];

    /**
     * The player's % confidence in the truth of this observation, from 0 to 100.
     */
    confidenceLevel: number = 100;
}
export class Evidence extends Describable {
    sourceType: EvidenceType = 'Concept';
    source: string | null = null; // null if source is unknown or if it hasn't been added as a concept yet
}