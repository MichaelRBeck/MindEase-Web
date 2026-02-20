import type { UserProfile } from "@/features/profile/domain/userProfile";
import type { UserProfileRepository } from "@/features/profile/domain/userProfileRepository";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "@/app/lib/firebase/client";

//Implementaçãodo repositório de perfil usando Firestore, responsável por carregar e persistir o perfil do usuário autenticado.
export class FirebaseUserProfileRepository implements UserProfileRepository {
    constructor(private readonly uid: string) { }

    clear(): Promise<void> {
        // Ainda não implementado (poderia resetar para defaults no Firestore)
        throw new Error("Method not implemented.");
    }

    // Referência padronizada: users/{uid}/profile/main
    private ref() {
        return doc(firestore, "users", this.uid, "profile", "main");
    }

    async load(): Promise<UserProfile | null> {
        const snap = await getDoc(this.ref());

        // Se não existir documento ainda, retorna null
        if (!snap.exists()) return null;

        return snap.data() as UserProfile;
    }

    async save(profile: UserProfile): Promise<void> {
        // merge:true evita sobrescrever campos não enviados
        await setDoc(this.ref(), profile, { merge: true });
    }
}
