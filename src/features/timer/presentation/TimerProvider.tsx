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

// Context do timer (pra evitar prop drilling nas páginas)
const TimerContext = createContext<TimerContextValue | null>(null);

const DEFAULT_SHORT_BREAK_MINUTES = 5;
const DEFAULT_LONG_BREAK_MINUTES = 15;
const DEFAULT_CYCLES_UNTIL_LONG_BREAK = 4;

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const { user, status } = useAuth();
    const uid = user?.uid;

    // Evita sync enquanto auth ainda está resolvendo
    const allowSync = status === "authenticated" && !!uid;

    // Repo do profile (pra puxar preferredFocusMinutes)
    const profileRepo = useMemo(() => {
        if (!uid) return null;
        return makeUserProfileRepository(uid);
    }, [uid]);

    // Minutos de foco que alimentam o config do Pomodoro
    const [focusMinutes, setFocusMinutes] = useState<number>(
        DEFAULT_USER_PROFILE.routine.preferredFocusMinutes
    );

    // Config usado pelo hook do Pomodoro (recalcula quando muda focusMinutes)
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

    // Aplica a preferência do profile, mas sem mexer no meio de uma sessão
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

        if (busy) return;

        setFocusMinutes(preferred);
    }

    // Sync inicial depois que autentica
    useEffect(() => {
        if (!allowSync) return;
        void syncFromProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowSync, profileRepo]);

    // Reage quando o usuário salva o profile (eventinho local)
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
