import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Ajusta a private key (corrige \n que vêm como string no .env)
function getPrivateKey() {
    const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (!key) return undefined;
    return key.replace(/\\n/g, "\n");
}

// Inicializa o Firebase Admin só uma vez (evita múltiplas instâncias)
function getAdminApp(): App {
    if (getApps().length) return getApps()[0]!;

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = getPrivateKey();

    // Garante que as variáveis obrigatórias existem
    if (!projectId || !clientEmail || !privateKey) {
        throw new Error("Firebase Admin env vars ausentes (FIREBASE_ADMIN_*)");
    }

    return initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

// App Admin compartilhado no server
export const firebaseAdminApp = getAdminApp();

// Auth Admin (verificação de sessão, etc.)
export const adminAuth = getAuth(firebaseAdminApp);

// Firestore Admin (acesso total no servidor)
export const adminDb = getFirestore(firebaseAdminApp);
