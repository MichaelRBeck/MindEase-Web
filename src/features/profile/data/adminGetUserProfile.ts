import "server-only";
import type { UserProfile } from "@/features/profile/domain/userProfile";
import { DEFAULT_USER_PROFILE } from "@/features/profile/domain/userProfile";
import { getAdminDb } from "@/app/lib/firebase/admin";


//Busca o perfil do usuário diretamente no Firestore via Admin SDK (SSR).

//Caso não existir documento irá retorna DEFAULT_USER_PROFILE.
//Se existir parcialmente preenchido, faz merge com os defaults

export async function adminGetUserProfile(uid: string): Promise<UserProfile> {
    const adminDb = getAdminDb();

    const ref = adminDb
        .collection("users")
        .doc(uid)
        .collection("profile")
        .doc("main");

    const snap = await ref.get();

    // Se ainda não existe perfil salvo, retorna defaults
    if (!snap.exists) return DEFAULT_USER_PROFILE;

    // Merge defensivo para evitar campos undefined
    const data = snap.data() as Partial<UserProfile>;
    return { ...DEFAULT_USER_PROFILE, ...data };
}
