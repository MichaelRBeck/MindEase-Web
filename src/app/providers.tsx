"use client";

import * as React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { AuthProvider } from "@/features/auth/presentation/AuthProvider";
import { CognitiveProvider } from "@/features/cognitive/presentation/CognitiveProvider";
import { CognitiveEffects } from "@/features/cognitive/presentation/CognitiveEffects";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ReduxProvider store={store}>
            <AuthProvider>
                <CognitiveProvider>
                    <CognitiveEffects />
                    {children}
                </CognitiveProvider>
            </AuthProvider>
        </ReduxProvider>
    );
}
