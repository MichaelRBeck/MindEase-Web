import type { UserProfileRepository } from "@/features/profile/domain/userProfileRepository";
import { FirebaseUserProfileRepository } from "@/features/profile/data/firebaseUserProfileRepository";

export function makeUserProfileRepository(uid: string): UserProfileRepository {
    return new FirebaseUserProfileRepository(uid);
}

export const PROFILE_UPDATED_EVENT = "mindease:profileUpdated";
export function emitProfileUpdated() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}
