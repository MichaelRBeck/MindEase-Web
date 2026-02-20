import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/app/lib/firebase/admin";

// Lê o cookie de sessão e valida no Firebase Admin (lado servidor)
export async function getServerUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get("__session")?.value;

    if (!session) return null;

    try {
        const adminAuth = getAdminAuth();
        return await adminAuth.verifySessionCookie(session, true);
    } catch {
        return null;
    }
}
