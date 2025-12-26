import { Describable, Concept } from "./concept";
import { EvidenceType } from "./const";

export class Observation extends Concept {
    conceptKeys: string[] = [];
    evidenceList: Evidence[] = [];
}
export class Evidence extends Describable {
    sourceType: EvidenceType;
    sourceKey: string | null = null; // null if source is unknown or if it hasn't been added as a concept yet
}