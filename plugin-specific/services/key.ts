import { Notice } from "obsidian";
import { KeyValue } from "plugin-specific/models/key-value";

export class KeyService {
    static ChangeKeyReference(refList: any[], keyToChange: string, newKey: string) {
        for (let i = 0; i < refList.length; i++) {
            if (refList[i] === keyToChange) {
                refList[i] = newKey;
            }
        }
    }
    static ChangeInnerKeyReference(refList: any[], isOldKey: (ref: any) => boolean, updateValue: (refIndex: number) => void) {
        for (let i = 0; i < refList.length; i++) {
            if (isOldKey(refList[i])) updateValue(i);
        }
    }
    
    static HasKey<T>(
        array: KeyValue<T>[],
        key: string
    ): boolean {
        return this.FindKey(array, key) !== -1;
    }

    static HasValue<T>(
        array: KeyValue<T>[],
        value: T,
        equalsFunction = (a: T, b: T) => { return a === b }
    ): boolean {
        return this.FindValue(array, value, equalsFunction) !== -1;
    }

    static HasPair<T>(
        array: KeyValue<T>[],
        pair: KeyValue<T>,
        equalsFunction: (a: KeyValue<T>, b: KeyValue<T>) => boolean
    ): boolean {
        for (let i = 0; i < array.length; i++) {
            const currentPair = array[i];
            if (equalsFunction(currentPair, pair)) {
                return true;
            }
        }
        return false;
    }

    static FindKey<T>(
        array: KeyValue<T>[],
        key: string
    ) {
        for (let i = 0; i < array.length; i++) {
            const currentPair = array[i];
            if (currentPair.key === key) {
                return i;
            }
        }
        return -1;
    }

    static FindValue<T>(
        array: KeyValue<T>[],
        value: T,
        equalsFunction = (a: T, b: T) => { return a === b }
    ) {
        for (let i = 0; i < array.length; i++) {
            const currentPair = array[i];
            if (equalsFunction(currentPair.value, value)) {
                return i;
            }
        }
        return -1;
    }
    static CheckIfDuplicateKey(
        mainArray: KeyValue<any>[],
        newKey: string
    ) {
        const existingKeyIndex = this.FindKey(mainArray, newKey);
        if (existingKeyIndex !== -1) {
            new Notice('This key is already registered!');
            throw new Error('This key is already registered!');
        }
    }
    static CheckIfDuplicateValue(
        mainArray: KeyValue<any>[],
        newValue: any,
        equalsFunction = (arrayVal: any, newVal: any) => { return arrayVal === newVal }
    ) {
        const existingValueIndex = this.FindValue(mainArray, newValue, equalsFunction);
        if (existingValueIndex !== -1) {
            new Notice('This value is already registered!');
            throw new Error('This value is already registered!');
        }
    }
    static Get(mainArray: KeyValue<any>[], key: string) {
        const index = this.FindKey(mainArray, key);
        if (index !== -1) {
            return mainArray[index].value;
        }
        return undefined;
    }
}