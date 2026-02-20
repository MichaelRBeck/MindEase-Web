import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth } from "./admin";

// Nome do cookie pode ser customizado por env
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "mindease_session";

// Lê o cookie de sessão e valida usando Firebase Admin
export async function getServerUser() {
    const cookie = await cookies();
    const session = cookie.get(COOKIE_NAME)?.value;

    // Sem cookie = sem usuário autenticado
    if (!session) return null;

    try {
        // Verifica o session cookie e retorna dados básicos do usuário
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(session, true);

        return {
            uid: decoded.uid,
            email: decoded.email ?? null,
        };
    } catch {
        // Se o cookie for inválido ou expirado
        return null;
    }
}

export { COOKIE_NAME };
