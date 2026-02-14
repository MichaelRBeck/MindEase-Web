import { useEffect, useMemo, useRef, useState } from "react";
import {
    PomodoroConfig,
    PomodoroState,
    createInitialPomodoro,
    nextPhase,
    resetPomodoro,
    tick,
    toggleRun,
} from "@/features/timer/domain/pomodoro";

export function usePomodoroTimer(config: PomodoroConfig) {
    const [state, setState] = useState<PomodoroState>(() => createInitialPomodoro(config));
    const configRef = useRef(config);

    // ✅ mantém ref atualizada + reseta quando config muda (corrige “clicar 2x”)
    useEffect(() => {
        configRef.current = config;
        setState((prev) => resetPomodoro(prev, config));
    }, [config]);

    // tick sempre (mas tick() só reduz se isRunning = true)
    useEffect(() => {
        const id = window.setInterval(() => {
            setState((prev) => tick(prev));
        }, 1000);
        return () => window.clearInterval(id);
    }, []);

    // ✅ quando zera, avança de fase e para (transição gentil)
    useEffect(() => {
        if (state.secondsLeft !== 0) return;
        setState((prev) => nextPhase(prev, configRef.current));
    }, [state.secondsLeft]);

    const actions = useMemo(
        () => ({
            start: () => setState((s) => toggleRun(s, true)),
            pause: () => setState((s) => toggleRun(s, false)),
            resume: () => setState((s) => toggleRun(s, true)),
            reset: () => setState((s) => resetPomodoro(s, configRef.current)),
            skip: () => setState((s) => nextPhase({ ...s, isRunning: false }, configRef.current)),
        }),
        []
    );

    return { state, actions };
}
