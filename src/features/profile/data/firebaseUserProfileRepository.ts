import type { UserProfile } from "@/features/profile/domain/userProfile";
import type { UserProfileRepository } from "@/features/profile/domain/userProfileRepository";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "@/app/lib/firebase/client";

export class FirebaseUserProfileRepository implements UserProfileRepository {
    constructor(private readonly uid: string) { }
    clear(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private ref() {
        return doc(firestore, "users", this.uid, "profile", "main");
    }

    async load(): Promise<UserProfile | null> {
        const snap = await getDoc(this.ref());
        if (!snap.exists()) return null;
        return snap.data() as UserProfile;
    }

    async save(profile: UserProfile): Promise<void> {
        await setDoc(this.ref(), profile, { merge: true });
    }
}
