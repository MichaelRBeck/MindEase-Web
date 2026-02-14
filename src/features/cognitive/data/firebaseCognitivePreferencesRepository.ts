import type { CognitivePreferences } from "@/features/cognitive/domain/preferences";
import type { CognitivePreferencesRepository } from "@/features/cognitive/domain/preferencesRepository";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "@/app/lib/firebase/client";

export class FirebaseCognitivePreferencesRepository implements CognitivePreferencesRepository {
    constructor(private readonly uid: string) { }
    clear(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private ref() {
        return doc(firestore, "users", this.uid, "cognitivePreferences", "main");
    }

    async load(): Promise<CognitivePreferences | null> {
        const snap = await getDoc(this.ref());
        if (!snap.exists()) return null;
        return snap.data() as CognitivePreferences;
    }

    async save(prefs: CognitivePreferences): Promise<void> {
        await setDoc(this.ref(), prefs, { merge: true });
    }
}
