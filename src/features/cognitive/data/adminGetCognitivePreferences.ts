import "server-only";
import type { CognitivePreferences } from "@/features/cognitive/domain/preferences";
import { DEFAULT_COGNITIVE_PREFS } from "@/features/cognitive/domain/preferences";
import { adminDb } from "@/app/lib/firebase/admin";

export async function adminGetCognitivePreferences(uid: string): Promise<CognitivePreferences> {
    const ref = adminDb.collection("users").doc(uid).collection("cognitivePreferences").doc("main");
    const snap = await ref.get();
    if (!snap.exists) return DEFAULT_COGNITIVE_PREFS;

    const data = snap.data() as Partial<CognitivePreferences>;
    return { ...DEFAULT_COGNITIVE_PREFS, ...data };
}
