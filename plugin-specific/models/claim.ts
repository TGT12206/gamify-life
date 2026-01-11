import { Concept } from "./concept";
import { EvidenceType } from "./const";
import { Life } from "./life";

/**
 * A verifiable claim about a given concept or concepts
 */
export class Claim extends Concept {
    override categoryKeys: string[] = ['Claim'];

    override GetName(life: Life): string | undefined {
        let representation = 'Claim';
        const numKeys = this.conceptKeys.length;
        if (numKeys > 0) {
            const concept = life.concepts.get(this.conceptKeys[0]);
            if (concept !== undefined) {
                representation += ' about ' + concept.GetName(life);
            }
        }
        for (let i = 2; i < numKeys - 1; i++) {
            const concept = life.concepts.get(this.conceptKeys[i]);
            if (concept !== undefined) {
                representation += ', ' + concept.GetName(life);
            }
        }
        if (numKeys > 1) {
            const concept = life.concepts.get(this.conceptKeys[numKeys - 1]);
            if (concept !== undefined) {
                representation += (numKeys > 2 ?  ',' : '') + ' and ' + concept.GetName(life);
            }
        }

        representation += ':';

        const description = this.description;
        const summary = description.length > 128 ? description.substring(0, 128) + '...' : description;

        representation += '\n\n' + summary;

        return representation;
    }

    /**
     * The concepts that this claim is about
     */
    conceptKeys: string[] = [];
    
    /**
     * A list of sources to support this claim
     */
    evidenceList: Evidence[] = [];

    /**
     * The player's % confidence in the truth of this claim, from 0 to 100.
     */
    confidenceLevel: number = 100;

    override RemoveConceptReferenceFromSelf(key: string): void {
        super.RemoveConceptReferenceFromSelf(key);
        this.conceptKeys = this.conceptKeys.filter(k => k !== key);
        this.evidenceList = this.evidenceList.filter(e => !(e.sourceType === 'Concept' && e.source === key));
    }

    override RemoveMediaPathFromSelf(path: string): void {
        super.RemoveMediaPathFromSelf(path);
        this.evidenceList = this.evidenceList.filter(e => !(e.sourceType === 'Media' && e.source === path));
    }

    override ChangeMediaPathInSelf(oldPath: string, newPath: string): void {
        super.ChangeMediaPathInSelf(oldPath, newPath);
        
        const el = this.evidenceList;
        for (let j = 0; j < el.length; j++) {
            if (el[j].sourceType === 'Media' && el[j].source === oldPath) {
                el[j].source = newPath;
            }
        }
    }
}

/**
 * 
 */
export class Evidence {
    /**
     * 
     */
    sourceType: EvidenceType = 'Concept';
    
    /**
     * A reference to the source for this evidence
     */
    source: string | null = null;
    
    /**
     * An explanation for why this evidence supports the claim
     */
    explanation: string = '';

    /**
     * The level of strength by which this evidence supports the claim.
     * Can be negative. Not used by the plugin except for sorting
     */
    supportingStrength: number = 100;
}