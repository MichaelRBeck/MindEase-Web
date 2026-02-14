"use client";

import * as React from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as fbSignOut,
    type User,
    setPersistence,
    browserSessionPersistence,
} from "firebase/auth";
import { firebaseAuth } from "@/app/lib/firebase/client";
import { useAppDispatch } from "@/store/hooks";
import { setAuthState } from "@/features/auth/presentation/store/authSlice";
import { clearTasks } from "@/features/tasks/presentation/store/tasksSlice";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
    user: User | null;
    status: AuthStatus;

    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function createSessionCookie(idToken: string) {
    await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
    });
}

async function clearSessionCookie() {
    await fetch("/api/session", { method: "DELETE", credentials: "include" });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null);
    const [status, setStatus] = React.useState<AuthStatus>("loading");
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        let alive = true;

        (async () => {
            await setPersistence(firebaseAuth, browserSessionPersistence).catch(() => { });
            if (!alive) return;

            dispatch(setAuthState({ uid: null, status: "loading" }));

            const unsub = onAuthStateChanged(firebaseAuth, async (u) => {
                setUser(u);

                if (!u) {
                    setStatus("anonymous");
                    dispatch(setAuthState({ uid: null, status: "anonymous" }));
                    await clearSessionCookie().catch(() => { });
                    return;
                }

                setStatus("authenticated");
                dispatch(setAuthState({ uid: u.uid, status: "authenticated" }));

                const idToken = await u.getIdToken();
                await createSessionCookie(idToken).catch(() => { });
            });

            return unsub;
        })();

        return () => {
            alive = false;
        };
    }, [dispatch]);

    const value = React.useMemo<AuthContextValue>(
        () => ({
            user,
            status,
            signIn: async (email, password) => {
                const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
                const idToken = await cred.user.getIdToken();
                await createSessionCookie(idToken);
            },
            signUp: async (email, password) => {
                const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
                const idToken = await cred.user.getIdToken();
                await createSessionCookie(idToken);
            },
            signOut: async () => {
                await fbSignOut(firebaseAuth);
                await clearSessionCookie();
                dispatch(clearTasks());
                dispatch(setAuthState({ uid: null, status: "anonymous" }));
            },
        }),
        [user, status]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
