import type { CognitivePreferences } from "./preferences";

export interface CognitivePreferencesRepository {
    load(): Promise<CognitivePreferences | null>;
    save(prefs: CognitivePreferences): Promise<void>;
    clear(): Promise<void>;
}
