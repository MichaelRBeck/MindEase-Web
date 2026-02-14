import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

function getClientApp(): FirebaseApp {
    const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    };

    if (!config.apiKey || !config.projectId || !config.appId) {
        throw new Error("Firebase client env vars ausentes (NEXT_PUBLIC_FIREBASE_*)");
    }

    return getApps().length ? getApp() : initializeApp(config);
}

export const firebaseClientApp = getClientApp();
export const firebaseAuth = getAuth(firebaseClientApp);
export const firestore = getFirestore(firebaseClientApp);
