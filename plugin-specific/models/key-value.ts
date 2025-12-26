export class KeyValue<T> {
    key: string;
    value: T;

    constructor(key: string, value: T) {
        this.key = key;
        this.value = value;
    }
}