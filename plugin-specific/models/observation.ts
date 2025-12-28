import { Describable, Concept } from "./concept";
import { EvidenceType } from "./const";

export class Observation extends Concept {
    conceptNames: string[] = [];
    evidenceList: Evidence[] = [];
}
export class Evidence extends Describable {
    sourceType: EvidenceType;
    source: string | null = null; // null if source is unknown or if it hasn't been added as a concept yet
}