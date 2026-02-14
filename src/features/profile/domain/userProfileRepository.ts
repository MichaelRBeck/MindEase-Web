import type { UserProfile } from "@/features/profile/domain/userProfile";

export interface UserProfileRepository {
    load(): Promise<UserProfile | null>;
    save(profile: UserProfile): Promise<void>;
    clear(): Promise<void>;
}
