"use client";

import * as React from "react";
import { DEFAULT_USER_PROFILE, type UserProfile } from "@/features/profile/domain/userProfile";
import { useAuth } from "@/features/auth/presentation/AuthProvider";
import { makeUserProfileRepository, PROFILE_UPDATED_EVENT } from "@/features/profile/data/userProfileRepositoryFactory";

// Hook responsável por carregar e manter o perfil do usuário no client
export function useUserProfile() {
    const { user } = useAuth();
    const uid = user?.uid ?? null;

    // Cria o repositório vinculado ao UID atual
    const repo = React.useMemo(() => (uid ? makeUserProfileRepository(uid) : null), [uid]);

    const [profile, setProfile] = React.useState<UserProfile>(DEFAULT_USER_PROFILE);
    const [hydrated, setHydrated] = React.useState(false);

    const load = React.useCallback(async () => {
        if (!repo) {
            setProfile(DEFAULT_USER_PROFILE);
            setHydrated(false);
            return;
        }

        const stored = await repo.load();
        setProfile(stored ?? DEFAULT_USER_PROFILE);
        setHydrated(true);
    }, [repo]);

    React.useEffect(() => {
        void load();

        const onProfileUpdated = () => void load();

        // (se em algum momento vocês tiverem storage local no client)
        const onStorage = (e: StorageEvent) => {
            if (!uid && e.key === "mindease:userProfile:v1") void load();
        };

        window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated as EventListener);
        if (!uid) window.addEventListener("storage", onStorage);

        return () => {
            window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated as EventListener);
            if (!uid) window.removeEventListener("storage", onStorage);
        };
    }, [load, uid]);

    // Se não houver usuário autenticado, devolve padrão, mas sem quebrar as regras de hooks
    if (!uid) return { profile: DEFAULT_USER_PROFILE, hydrated: false };

    return { profile, hydrated };
}