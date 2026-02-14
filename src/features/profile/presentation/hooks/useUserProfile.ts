"use client";

import * as React from "react";
import { DEFAULT_USER_PROFILE, type UserProfile } from "@/features/profile/domain/userProfile";
import { useAuth } from "@/features/auth/presentation/AuthProvider";
import {
    makeUserProfileRepository,
    PROFILE_UPDATED_EVENT,
} from "@/features/profile/data/userProfileRepositoryFactory";

export function useUserProfile() {
    const { user } = useAuth();
    const uid = user?.uid;
    if (!uid) return { profile: DEFAULT_USER_PROFILE, hydrated: false };
    const repo = React.useMemo(() => makeUserProfileRepository(uid), [uid]);

    const [profile, setProfile] = React.useState<UserProfile>(DEFAULT_USER_PROFILE);
    const [hydrated, setHydrated] = React.useState(false);

    const load = React.useCallback(async () => {
        const stored = await repo.load();
        setProfile(stored ?? DEFAULT_USER_PROFILE);
        setHydrated(true);
    }, [repo]);

    React.useEffect(() => {
        void load();

        const onProfileUpdated = () => void load();

        // ✅ Só faz sentido ouvir "storage" quando o repo é LocalStorage (anônimo)
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
