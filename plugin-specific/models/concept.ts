export class Describable {
    mediaKeys: string[] = [];
    description: string = '';
}

export class Concept extends Describable {
    name: string = '';
    aliases: string[] = [];
    categoryKeys: string[] = [];
}