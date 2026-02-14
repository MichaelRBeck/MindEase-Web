import "server-only";
import type { UserProfile } from "@/features/profile/domain/userProfile";
import { DEFAULT_USER_PROFILE } from "@/features/profile/domain/userProfile";
import { adminDb } from "@/app/lib/firebase/admin";

export async function adminGetUserProfile(uid: string): Promise<UserProfile> {
    const ref = adminDb.collection("users").doc(uid).collection("profile").doc("main");
    const snap = await ref.get();
    if (!snap.exists) return DEFAULT_USER_PROFILE;

    const data = snap.data() as Partial<UserProfile>;
    return { ...DEFAULT_USER_PROFILE, ...data };
}
