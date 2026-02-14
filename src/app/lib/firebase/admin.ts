import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getPrivateKey() {
    const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (!key) return undefined;
    return key.replace(/\\n/g, "\n");
}

function getAdminApp(): App {
    if (getApps().length) return getApps()[0]!;

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = getPrivateKey();

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

export const firebaseAdminApp = getAdminApp();
export const adminAuth = getAuth(firebaseAdminApp);
export const adminDb = getFirestore(firebaseAdminApp);
