import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/app/lib/firebase/admin";

const COOKIE_NAME = "__session";

export async function POST(req: Request) {
    const { idToken } = (await req.json()) as { idToken?: string };
    if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

    // 1 dia
    const expiresIn = 1 * 24 * 60 * 60 * 1000;

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: Math.floor(expiresIn / 1000),
    });

    return NextResponse.json({ ok: true });
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return NextResponse.json({ ok: true });
}
