import "server-only";
import type { RootState } from "@/store/makeStore";
import { adminListTasks } from "@/features/tasks/data/adminListTasks";
import { adminGetUserProfile } from "@/features/profile/data/adminGetUserProfile";
import { adminGetCognitivePreferences } from "@/features/cognitive/data/adminGetCognitivePreferences";
import { DEFAULT_COGNITIVE_PREFS } from "@/features/cognitive/domain/preferences";
import { DEFAULT_USER_PROFILE } from "@/features/profile/domain/userProfile";

// importe sua função de overrides (idealmente do domain)
import { needsToCognitiveOverrides } from "@/features/cognitive/domain/needsToCognitiveOverrides";

export async function makeAppPreloadedState(uid: string): Promise<RootState> {
    const [tasks, profile, cognitive] = await Promise.all([
        adminListTasks(uid),
        adminGetUserProfile(uid),
        adminGetCognitivePreferences(uid),
    ]);

    const overrides = needsToCognitiveOverrides(profile);
    const mergedCognitive = { ...DEFAULT_COGNITIVE_PREFS, ...cognitive, ...overrides };

    return {
        auth: { uid, status: "authenticated" },
        tasks: { uid, items: tasks, loading: false, error: null, hydrated: true },
        // se você criar slices:
        // profile: { data: profile, hydrated: true },
        // cognitive: { applied: mergedCognitive, draft: mergedCognitive, hydrated: true },
    } as RootState;
}
