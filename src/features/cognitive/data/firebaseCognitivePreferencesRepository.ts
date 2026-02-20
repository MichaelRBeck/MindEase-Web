import type { CognitivePreferences } from "@/features/cognitive/domain/preferences";
import type { CognitivePreferencesRepository } from "@/features/cognitive/domain/preferencesRepository";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getClientFirestore } from "@/app/lib/firebase/client";

// Implementação concreta do repositório usando Firestore (lado client)
export class FirebaseCognitivePreferencesRepository implements CognitivePreferencesRepository {
    constructor(private readonly uid: string) { }

    // Ainda não implementado (caso queira limpar tudo no futuro)
    clear(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    // Referência do documento: users/{uid}/cognitivePreferences/main
    private ref() {
        const firestore = getClientFirestore();
        return doc(firestore, "users", this.uid, "cognitivePreferences", "main");
    }

    // Carrega preferências salvas do usuário
    async load(): Promise<CognitivePreferences | null> {
        const snap = await getDoc(this.ref());
        if (!snap.exists()) return null;

        return snap.data() as CognitivePreferences;
    }

    // Salva preferências (merge para não sobrescrever tudo)
    async save(prefs: CognitivePreferences): Promise<void> {
        await setDoc(this.ref(), prefs, { merge: true });
    }
}
