import type { UserProfileRepository } from "@/features/profile/domain/userProfileRepository";
import { FirebaseUserProfileRepository } from "@/features/profile/data/firebaseUserProfileRepository";

// Factory simples para criar o repositório de perfil do usuário autenticado
export function makeUserProfileRepository(uid: string): UserProfileRepository {
    return new FirebaseUserProfileRepository(uid);
}

// Evento global usado para notificar que o perfil foi atualizado, permitindo que outras partes da aplicação reajam
export const PROFILE_UPDATED_EVENT = "mindease:profileUpdated";

export function emitProfileUpdated() {
    // Garante que só roda no client
    if (typeof window === "undefined") return;

    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}
