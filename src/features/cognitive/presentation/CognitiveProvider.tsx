"use client";

import * as React from "react";
import type { CognitivePreferences } from "@/features/cognitive/domain/preferences";
import { DEFAULT_COGNITIVE_PREFS } from "@/features/cognitive/domain/preferences";

import type { CognitivePreferencesRepository } from "@/features/cognitive/domain/preferencesRepository";
import { makeCognitivePreferencesRepository } from "@/features/cognitive/data/cognitivePreferencesRepositoryFactory";

import type { UserProfile } from "@/features/profile/domain/userProfile";
import { DEFAULT_USER_PROFILE } from "@/features/profile/domain/userProfile";
import type { UserProfileRepository } from "@/features/profile/domain/userProfileRepository";
import { makeUserProfileRepository, PROFILE_UPDATED_EVENT } from "@/features/profile/data/userProfileRepositoryFactory";

import { useAuth } from "@/features/auth/presentation/AuthProvider";

type CognitiveContextValue = {
    applied: CognitivePreferences;
    draft: CognitivePreferences;

    updateDraft: (patch: Partial<CognitivePreferences>) => void;
    applyDraft: () => Promise<void>;
    applyPatch: (patch: Partial<CognitivePreferences>) => Promise<void>;
    resetDraft: () => void;
    resetPreferences: () => Promise<void>;

    hasPendingChanges: boolean;
};

const CognitiveContext = React.createContext<CognitiveContextValue | null>(null);

function stableStringify(p: CognitivePreferences) {
    return JSON.stringify(p);
}

// Converte “needs” do perfil em ajustes automáticos do painel cognitivo
export function needsToCognitiveOverrides(profile: UserProfile): Partial<CognitivePreferences> {
    const { needs } = profile;

    return {
        detailMode: needs.shortTexts ? "summary" : "detailed",
        complexityLevel: needs.shortTexts ? "simple" : DEFAULT_COGNITIVE_PREFS.complexityLevel,

        animationsEnabled: needs.reduceStimuli ? false : DEFAULT_COGNITIVE_PREFS.animationsEnabled,
        spacingMultiplier: needs.reduceStimuli ? 1.1 : DEFAULT_COGNITIVE_PREFS.spacingMultiplier,
        lineSpacing: needs.reduceStimuli ? 1.6 : DEFAULT_COGNITIVE_PREFS.lineSpacing,

        contrastLevel: needs.highContrastPreferred ? "high" : DEFAULT_COGNITIVE_PREFS.contrastLevel,

        cognitiveAlertsEnabled: needs.gentleReminders ? true : false,
        alertThresholdMinutes: needs.gentleReminders ? 30 : DEFAULT_COGNITIVE_PREFS.alertThresholdMinutes,
    };
}

export function CognitiveProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const uid = user?.uid ?? null;

    // Repo de prefs cognitivas (Firestore)
    const repo = React.useMemo<CognitivePreferencesRepository | null>(() => {
        if (!uid) return null;
        return makeCognitivePreferencesRepository(uid);
    }, [uid]);

    // Repo do perfil (pra puxar “needs” e aplicar defaults inteligentes)
    const profileRepo = React.useMemo<UserProfileRepository | null>(() => {
        if (!uid) return null;
        return makeUserProfileRepository(uid);
    }, [uid]);

    const [applied, setApplied] = React.useState<CognitivePreferences>(DEFAULT_COGNITIVE_PREFS);
    const [draft, setDraft] = React.useState<CognitivePreferences>(DEFAULT_COGNITIVE_PREFS);
    const [hydrated, setHydrated] = React.useState(false);

    // Marca se já existia pref salva (pra não sobrescrever com “needs” depois)
    const [hasStoredPrefs, setHasStoredPrefs] = React.useState(false);
    const hasStoredPrefsRef = React.useRef(false);

    // Carrega preferências salvas quando o uid/repo muda
    React.useEffect(() => {
        let alive = true;

        (async () => {
            setHydrated(false);

            if (!repo) {
                if (!alive) return;

                hasStoredPrefsRef.current = false;
                setHasStoredPrefs(false);

                setApplied(DEFAULT_COGNITIVE_PREFS);
                setDraft(DEFAULT_COGNITIVE_PREFS);
                setHydrated(true);
                return;
            }

            const stored = await repo.load();
            const initial = stored ?? DEFAULT_COGNITIVE_PREFS;

            if (!alive) return;

            const exists = !!stored;
            hasStoredPrefsRef.current = exists;
            setHasStoredPrefs(exists);

            setApplied(initial);
            setDraft(initial);
            setHydrated(true);
        })();

        return () => {
            alive = false;
        };
    }, [repo]);

    // Detecta se o draft está diferente do que já está aplicado
    const hasPendingChanges = React.useMemo(() => {
        return stableStringify(applied) !== stableStringify(draft);
    }, [applied, draft]);

    function updateDraft(patch: Partial<CognitivePreferences>) {
        setDraft((prev) => ({ ...prev, ...patch }));
    }

    // Aplica o draft e persiste no repo
    async function applyDraft() {
        setApplied(draft);

        if (repo) {
            await repo.save(draft);
            hasStoredPrefsRef.current = true;
            setHasStoredPrefs(true);
        }
    }

    // Aplica um patch direto (bom pra ações rápidas tipo sair do foco)
    async function applyPatch(patch: Partial<CognitivePreferences>) {
        const next: CognitivePreferences = { ...applied, ...patch };

        setApplied(next);
        setDraft(next);

        if (repo) {
            await repo.save(next);
            hasStoredPrefsRef.current = true;
            setHasStoredPrefs(true);
        }
    }

    function resetDraft() {
        setDraft(applied);
    }

    // Volta tudo pro padrão (e salva)
    async function resetPreferences() {
        setApplied(DEFAULT_COGNITIVE_PREFS);
        setDraft(DEFAULT_COGNITIVE_PREFS);

        if (repo) {
            await repo.save(DEFAULT_COGNITIVE_PREFS);
            hasStoredPrefsRef.current = true;
            setHasStoredPrefs(true);
        }
    }

    // Só aplica “needs” do perfil se o usuário ainda não tiver prefs salvas
    async function syncNeedsFromProfile() {
        if (!repo || !profileRepo) return;
        if (hasStoredPrefsRef.current) return;

        const profile = (await profileRepo.load()) ?? DEFAULT_USER_PROFILE;
        const overrides = needsToCognitiveOverrides(profile);

        const next: CognitivePreferences = { ...DEFAULT_COGNITIVE_PREFS, ...overrides };

        setApplied(next);
        setDraft(next);

        hasStoredPrefsRef.current = true;
        setHasStoredPrefs(true);
    }

    React.useEffect(() => {
        if (!hydrated) return;
        if (!repo || !profileRepo) return;
        void syncNeedsFromProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hydrated, repo, profileRepo]);

    // Reage quando o perfil for salvo (pra recalcular needs -> prefs)
    React.useEffect(() => {
        if (!hydrated) return;
        if (!repo || !profileRepo) return;

        const onProfileUpdated = () => void syncNeedsFromProfile();

        window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated as EventListener);
        return () => {
            window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated as EventListener);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hydrated, repo, profileRepo]);

    const value = React.useMemo<CognitiveContextValue>(
        () => ({
            applied,
            draft,
            updateDraft,
            applyDraft,
            applyPatch,
            resetDraft,
            resetPreferences,
            hasPendingChanges,
        }),
        [applied, draft, hasPendingChanges]
    );

    return <CognitiveContext.Provider value={value}>{children}</CognitiveContext.Provider>;
}

export function useCognitive() {
    const ctx = React.useContext(CognitiveContext);
    if (!ctx) throw new Error("useCognitive must be used within CognitiveProvider");
    return ctx;
}
