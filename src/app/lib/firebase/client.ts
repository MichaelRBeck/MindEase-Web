import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

type FirebaseClientConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId: string;
};

function getClientConfig(): FirebaseClientConfig | null {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;

    if (!apiKey || !authDomain || !projectId || !appId) return null;

    return { apiKey, authDomain, projectId, appId, storageBucket, messagingSenderId };
}

export function getFirebaseClientApp(): FirebaseApp {
    if (getApps().length) return getApp();

    const cfg = getClientConfig();
    if (!cfg) {
        throw new Error("Firebase client env vars ausentes (NEXT_PUBLIC_FIREBASE_*)");
    }

    return initializeApp(cfg);
}

export function getFirebaseAuth(): Auth {
    return getAuth(getFirebaseClientApp());
}

export function getClientFirestore(): Firestore {
    return getFirestore(getFirebaseClientApp());
}