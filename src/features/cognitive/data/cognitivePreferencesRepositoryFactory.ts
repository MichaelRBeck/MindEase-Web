import type { CognitivePreferencesRepository } from "@/features/cognitive/domain/preferencesRepository";
import { FirebaseCognitivePreferencesRepository } from "@/features/cognitive/data/firebaseCognitivePreferencesRepository";

// Factory simples: cria o repositório de preferências cognitivas para um usuário específico
export function makeCognitivePreferencesRepository(uid: string): CognitivePreferencesRepository {
    return new FirebaseCognitivePreferencesRepository(uid);
}
