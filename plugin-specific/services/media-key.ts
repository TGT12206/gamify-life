import { KeyValue } from "plugin-specific/models/key-value";
import { Life } from "plugin-specific/models/life";
import { Observation } from "plugin-specific/models/observation";
import { KeyService } from "./key";

export class MediaKeyService {
    /**
     * Deletes the media key from the plugin, propagating the change.
     * @param media either the key (path) or the index of the media
     */
    static DeleteMediaKey(life: Life, media: number | string): void {
        let index: number;
        let keyToDelete: string;

        if (typeof media === 'number') {
            index = media;
            if (index < 0 || index >= life.mediaPaths.length) return;
            keyToDelete = life.mediaPaths[index].key;
        } else {
            keyToDelete = media;
            index = KeyService.FindKey(life.mediaPaths, keyToDelete);
        }

        life.mediaPaths.splice(index, 1);

        for (const item of life.concepts) {
            const concept = item.value;
            concept.mediaKeys = concept.mediaKeys.filter(mk => mk !== keyToDelete);
            if (concept.categoryKeys.contains('Observation')) {
                const observation = <Observation> concept;
                observation.evidenceList = observation.evidenceList.filter(e => !(e.sourceType === 'Media' && e.sourceKey === keyToDelete));
            }
        }
    }
    /**
     * Changes the media key
     * @param media either the key or the index of the media
     */
    static ChangeMediaKey(life: Life, media: number | string, newKey: string): void {
        let index: number;
        let keyToChange: string;
        
        if (typeof media === 'number') {
            index = media;
            if (index < 0 || index >= life.mediaPaths.length) return;
            keyToChange = life.mediaPaths[index].key;
        } else {
            keyToChange = media;
            index = KeyService.FindKey(life.mediaPaths, keyToChange);
            if (index < 0 || index >= life.mediaPaths.length) return;
        }

        life.mediaPaths[index].key = newKey;

        for (const item of life.concepts) {
            const concept = item.value;
            KeyService.ChangeKeyReference(concept.mediaKeys, keyToChange, newKey);

            if (concept.categoryKeys.contains('Observation')) {
                const observation = <Observation> concept;
                KeyService.ChangeInnerKeyReference(
                    observation.evidenceList,
                    (e) => { return e.sourceType === 'Media' && e.sourceKey === keyToChange },
                    (i) => { return observation.evidenceList[i].sourceKey = newKey }
                );
            }
        }
    }
}