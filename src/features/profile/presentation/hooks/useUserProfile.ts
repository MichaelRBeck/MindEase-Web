"use client";

import * as React from "react";
import { DEFAULT_USER_PROFILE, type UserProfile } from "@/features/profile/domain/userProfile";
import { useAuth } from "@/features/auth/presentation/AuthProvider";
import {
    makeUserProfileRepository,
    PROFILE_UPDATED_EVENT,
} from "@/features/profile/data/userProfileRepositoryFactory";

// Hook responsável por carregar e manter o perfil do usuário no client
export function useUserProfile() {
    const { user } = useAuth();
    const uid = user?.uid;

    // Se não houver usuário autenticado, retorna perfil padrão
    if (!uid) return { profile: DEFAULT_USER_PROFILE, hydrated: false };

    // Cria o repositório vinculado ao UID atual
    const repo = React.useMemo(() => makeUserProfileRepository(uid), [uid]);

    const [profile, setProfile] = React.useState<UserProfile>(DEFAULT_USER_PROFILE);
    const [hydrated, setHydrated] = React.useState(false);

    // Carrega perfil persistido (Firestore ou outro storage)
    const load = React.useCallback(async () => {
        const stored = await repo.load();
        setProfile(stored ?? DEFAULT_USER_PROFILE);
        setHydrated(true);
    }, [repo]);

    React.useEffect(() => {
        void load();

        // Atualiza perfil quando outro ponto da aplicação emitir evento de update
        const onProfileUpdated = () => void load();

        // Só escuta evento de storage se estiver usando LocalStorage (modo anônimo)
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

    return { profile, hydrated };
}
