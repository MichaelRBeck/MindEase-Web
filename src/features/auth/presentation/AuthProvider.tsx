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
import { getFirebaseAuth } from "@/app/lib/firebase/client";
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

// Envia o idToken pro server e vira cookie httpOnly (SSR consegue ler)
async function createSessionCookie(idToken: string) {
    await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
    });
}

// Apaga o cookie de sessão no server (logout)
async function clearSessionCookie() {
    await fetch("/api/session", { method: "DELETE", credentials: "include" });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null);
    const [status, setStatus] = React.useState<AuthStatus>("loading");
    const dispatch = useAppDispatch();

    const firebaseAuth = React.useMemo(() => getFirebaseAuth(), []);

    React.useEffect(() => {
        let alive = true;

        (async () => {
            // Mantém a sessão só durante a aba/janela (mais “leve” pro hackathon)
            await setPersistence(firebaseAuth, browserSessionPersistence).catch(() => { });
            if (!alive) return;

            // Redux começa em loading até o Firebase responder
            dispatch(setAuthState({ uid: null, status: "loading" }));

            // Listener principal de login/logout do Firebase
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

                // Gera cookie de sessão pro SSR identificar o usuário
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

            // Login + cria/atualiza cookie de sessão
            signIn: async (email, password) => {
                const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
                const idToken = await cred.user.getIdToken();
                await createSessionCookie(idToken);
            },

            // Cadastro + cria/atualiza cookie de sessão
            signUp: async (email, password) => {
                const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
                const idToken = await cred.user.getIdToken();
                await createSessionCookie(idToken);
            },

            // Logout: limpa Firebase, cookie e estado local
            signOut: async () => {
                await fbSignOut(firebaseAuth);
                await clearSessionCookie();
                dispatch(clearTasks());
                dispatch(setAuthState({ uid: null, status: "anonymous" }));
            },
        }),
        [user, status, dispatch]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
