import type { CognitivePreferencesRepository } from "@/features/cognitive/domain/preferencesRepository";
import { FirebaseCognitivePreferencesRepository } from "@/features/cognitive/data/firebaseCognitivePreferencesRepository";

export function makeCognitivePreferencesRepository(uid: string): CognitivePreferencesRepository {
    return new FirebaseCognitivePreferencesRepository(uid);
}
