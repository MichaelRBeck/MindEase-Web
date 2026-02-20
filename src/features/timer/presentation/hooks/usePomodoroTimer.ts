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
    // Estado principal do pomodoro (fase, tempo, rodando, ciclos)
    const [state, setState] = useState<PomodoroState>(() => createInitialPomodoro(config));

    // Guarda a config mais recente sem ficar recriando effects/handlers
    const configRef = useRef(config);

    // Atualiza a ref e reseta quando a config muda
    useEffect(() => {
        configRef.current = config;
        setState((prev) => resetPomodoro(prev, config));
    }, [config]);

    // Intervalo fixo: o tick só “anda” se isRunning estiver true
    useEffect(() => {
        const id = window.setInterval(() => {
            setState((prev) => tick(prev));
        }, 1000);

        return () => window.clearInterval(id);
    }, []);

    // Quando chega em 0, avança para a próxima fase e para (sem auto-start)
    useEffect(() => {
        if (state.secondsLeft !== 0) return;
        setState((prev) => nextPhase(prev, configRef.current));
    }, [state.secondsLeft]);

    // Ações públicas do timer (start/pause/reset/skip)
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
