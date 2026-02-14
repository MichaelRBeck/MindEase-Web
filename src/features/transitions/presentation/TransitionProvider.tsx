"use client";

import React, { createContext, useContext, useMemo, useRef, useState } from "react";

export type TransitionTone = "info" | "success";

export type TransitionPayload = {
    message: string;
    tone?: TransitionTone;
    actionLabel?: string;
    onAction?: () => void;
    durationMs?: number; // default 5000
    sticky?: boolean;
};

type TransitionContextValue = {
    show: (payload: TransitionPayload) => void;
    dismiss: () => void;
    current: (TransitionPayload & { id: number }) | null;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
    const [current, setCurrent] = useState<(TransitionPayload & { id: number }) | null>(null);
    const timerRef = useRef<number | null>(null);
    const idRef = useRef(1);

    const dismiss = () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = null;
        setCurrent(null);
    };

    const show = (payload: TransitionPayload) => {
        dismiss();
        const id = idRef.current++;
        const next = { ...payload, id };
        setCurrent(next);

        if (payload.sticky) return;

        const duration = payload.durationMs ?? 7000;
        timerRef.current = window.setTimeout(() => {
            setCurrent((cur) => (cur?.id === id ? null : cur));
            timerRef.current = null;
        }, duration);
    };


    const value = useMemo(() => ({ show, dismiss, current }), [current]);

    return <TransitionContext.Provider value={value}>{children}</TransitionContext.Provider>;
}

export function useTransition() {
    const ctx = useContext(TransitionContext);
    if (!ctx) throw new Error("useTransition must be used within TransitionProvider");
    return ctx;
}
