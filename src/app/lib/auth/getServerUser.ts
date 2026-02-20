import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/app/lib/firebase/admin";

// Lê o cookie de sessão e valida no Firebase Admin (lado servidor)
export async function getServerUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get("__session")?.value;

    // Se não tiver cookie, considera não autenticado
    if (!session) return null;

    try {
        // Verifica e decodifica o session cookie
        return await adminAuth.verifySessionCookie(session, true);
    } catch {
        // Se for inválido/expirado, trata como não autenticado
        return null;
    }
}
