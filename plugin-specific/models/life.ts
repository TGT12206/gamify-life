import { Concept } from "./concept";
import { KeyValue } from "./key-value";
import { Moment } from "./moment";
import { Observation } from "./observation";
import { Quest } from "./quest";
import { Rank, Skill, SkillUnit } from "./skill";

export class Life {
    categories: KeyValue<string>[] = [];
    concepts: KeyValue<Concept>[] = [];
    mediaPaths: KeyValue<string>[] = [];
    get skills(): Skill[] {
        return <Skill[]> this.concepts
            .map(pair => pair.value)
            .filter(c => c.categoryKeys.includes('Skill'));
    }
    get ranks(): Rank[] {
        return <Rank[]> this.concepts
            .map(pair => pair.value)
            .filter(c => c.categoryKeys.includes('Skill Rank'));
    }
    get skillUnits(): SkillUnit[] {
        return <SkillUnit[]> this.concepts
            .map(pair => pair.value)
            .filter(c => c.categoryKeys.includes('Skill Unit'));
    }
    get moments(): Moment[] {
        return <Moment[]> this.concepts
            .map(pair => pair.value)
            .filter(c => c.categoryKeys.includes('Moment'));
    }
    get observations(): Observation[] {
        return <Observation[]> this.concepts
            .map(pair => pair.value)
            .filter(c => c.categoryKeys.includes('Observation'));
    }
    get quests(): Quest[] {
        return <Quest[]> this.concepts
            .map(pair => pair.value)
            .filter(c => c.categoryKeys.includes('Observation'));
    }
}