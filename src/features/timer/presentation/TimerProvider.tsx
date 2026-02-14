"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PomodoroConfig } from "@/features/timer/domain/pomodoro";
import { usePomodoroTimer } from "@/features/timer/presentation/hooks/usePomodoroTimer";

import { useAuth } from "@/features/auth/presentation/AuthProvider";
import { DEFAULT_USER_PROFILE } from "@/features/profile/domain/userProfile";
import {
    makeUserProfileRepository,
    PROFILE_UPDATED_EVENT,
} from "@/features/profile/data/userProfileRepositoryFactory";

type TimerContextValue = {
    config: PomodoroConfig;
    setFocusMinutes: (min: number) => void;
    state: ReturnType<typeof usePomodoroTimer>["state"];
    actions: ReturnType<typeof usePomodoroTimer>["actions"];
};

const TimerContext = createContext<TimerContextValue | null>(null);

const DEFAULT_SHORT_BREAK_MINUTES = 5;
const DEFAULT_LONG_BREAK_MINUTES = 15;
const DEFAULT_CYCLES_UNTIL_LONG_BREAK = 4;

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const { user, status } = useAuth();
    const uid = user?.uid;

    // Como o app inteiro é protegido, isso não deve acontecer;
    // mas evita crash durante o "loading" inicial.
    const allowSync = status === "authenticated" && !!uid;

    const profileRepo = useMemo(() => {
        if (!uid) return null;
        return makeUserProfileRepository(uid);
    }, [uid]);

    const [focusMinutes, setFocusMinutes] = useState<number>(
        DEFAULT_USER_PROFILE.routine.preferredFocusMinutes
    );

    const config = useMemo<PomodoroConfig>(
        () => ({
            focusMinutes,
            shortBreakMinutes: DEFAULT_SHORT_BREAK_MINUTES,
            longBreakMinutes: DEFAULT_LONG_BREAK_MINUTES,
            cyclesUntilLongBreak: DEFAULT_CYCLES_UNTIL_LONG_BREAK,
        }),
        [focusMinutes]
    );

    const { state, actions } = usePomodoroTimer(config);

    // ✅ aplica preferência do profile sem quebrar sessão em andamento
    async function syncFromProfile() {
        if (!allowSync || !profileRepo) return;

        const profile = (await profileRepo.load()) ?? DEFAULT_USER_PROFILE;
        const preferred = profile.routine.preferredFocusMinutes;

        const totalSecondsByPhase =
            state.phase === "focus"
                ? config.focusMinutes * 60
                : state.phase === "shortBreak"
                    ? config.shortBreakMinutes * 60
                    : config.longBreakMinutes * 60;

        const hasSession = state.secondsLeft !== totalSecondsByPhase;
        const busy = state.isRunning || hasSession;

        // se está em uma sessão (rodando ou já iniciou), não altera no meio
        if (busy) return;

        setFocusMinutes(preferred);
    }

    // Load inicial (quando autenticar)
    useEffect(() => {
        if (!allowSync) return;
        void syncFromProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowSync, profileRepo]);

    // ✅ escuta “profileUpdated” (agora não usamos mais storage)
    useEffect(() => {
        if (!allowSync) return;

        const onProfileUpdated = () => void syncFromProfile();

        window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated as EventListener);
        return () => {
            window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated as EventListener);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowSync, state.isRunning, state.secondsLeft, state.phase, config, profileRepo]);

    const value = useMemo(
        () => ({
            config,
            setFocusMinutes,
            state,
            actions,
        }),
        [config, state, actions]
    );

    return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
    const ctx = useContext(TimerContext);
    if (!ctx) throw new Error("useTimer must be used within TimerProvider");
    return ctx;
}
