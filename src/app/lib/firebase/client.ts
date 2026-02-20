import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Inicializa o Firebase no client (evita criar múltiplas instâncias)
function getClientApp(): FirebaseApp {
    const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    };

    // Validação básica das env públicas obrigatórias
    if (!config.apiKey || !config.projectId || !config.appId) {
        throw new Error("Firebase client env vars ausentes (NEXT_PUBLIC_FIREBASE_*)");
    }

    // Se já tiver app inicializado, reutiliza
    return getApps().length ? getApp() : initializeApp(config);
}

// Instância principal do Firebase no client
export const firebaseClientApp = getClientApp();

// Auth do lado do cliente (login, logout, etc.)
export const firebaseAuth = getAuth(firebaseClientApp);

// Firestore no client (acesso restrito pelas rules)
export const firestore = getFirestore(firebaseClientApp);
