export class Observation {
    objectObservedPaths: string[] = [];
    mediaPaths: string[] = [];
    description: string = '';
    evidenceList: Evidence[] = [];
}
export class Evidence {
    type: EvidenceType = 'Firsthand account of actions';
    sourcePath: string;
}

export const evidenceTypes = [
    'Firsthand account of actions',
    'Secondhand account of actions',
    'Firsthand account of words',
    'Secondhand account of words',
    'Inference'
] as const;

export type EvidenceType = typeof evidenceTypes[number];