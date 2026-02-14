import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "./admin";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "mindease_session";

export async function getServerUser() {
    const cookie = await cookies();
    const session = cookie.get(COOKIE_NAME)?.value;
    if (!session) return null;

    try {
        const decoded = await adminAuth.verifySessionCookie(session, true);
        return { uid: decoded.uid, email: decoded.email ?? null };
    } catch {
        return null;
    }
}

export { COOKIE_NAME };
