import "server-only";
import type { CognitivePreferences } from "@/features/cognitive/domain/preferences";
import { DEFAULT_COGNITIVE_PREFS } from "@/features/cognitive/domain/preferences";
import { adminDb } from "@/app/lib/firebase/admin";

// Busca preferências cognitivas do usuário direto no Firestore (Admin)
export async function adminGetCognitivePreferences(uid: string): Promise<CognitivePreferences> {
    const ref = adminDb
        .collection("users")
        .doc(uid)
        .collection("cognitivePreferences")
        .doc("main");

    const snap = await ref.get();

    // Se não existir documento ainda, retorna padrão
    if (!snap.exists) return DEFAULT_COGNITIVE_PREFS;

    const data = snap.data() as Partial<CognitivePreferences>;

    // Merge com default para garantir que nada fique undefined
    return { ...DEFAULT_COGNITIVE_PREFS, ...data };
}
