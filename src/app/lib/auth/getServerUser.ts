import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/app/lib/firebase/admin";

export async function getServerUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get("__session")?.value;
    if (!session) return null;

    try {
        return await adminAuth.verifySessionCookie(session, true);
    } catch {
        return null;
    }
}
