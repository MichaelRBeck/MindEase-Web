export type PomodoroPhase = "focus" | "shortBreak" | "longBreak";

export type PomodoroConfig = {
    focusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    cyclesUntilLongBreak: number;
};

export type PomodoroState = {
    phase: PomodoroPhase;
    secondsLeft: number;
    isRunning: boolean;
    focusCyclesCompleted: number; // controla quando deve entrar em pausa longa
};

// Converte minutos da fase atual para segundos
export function getPhaseSeconds(
    config: PomodoroConfig,
    phase: PomodoroPhase
): number {
    const minutes =
        phase === "focus"
            ? config.focusMinutes
            : phase === "shortBreak"
                ? config.shortBreakMinutes
                : config.longBreakMinutes;

    return Math.max(1, Math.round(minutes * 60));
}

// Estado inicial sempre começa em foco, parado
export function createInitialPomodoro(
    config: PomodoroConfig
): PomodoroState {
    return {
        phase: "focus",
        secondsLeft: getPhaseSeconds(config, "focus"),
        isRunning: false,
        focusCyclesCompleted: 0,
    };
}

// Liga ou pausa o timer
export function toggleRun(
    state: PomodoroState,
    running: boolean
): PomodoroState {
    return { ...state, isRunning: running };
}

// Reseta completamente para o início
export function resetPomodoro(
    state: PomodoroState,
    config: PomodoroConfig
): PomodoroState {
    return {
        phase: "focus",
        secondsLeft: getPhaseSeconds(config, "focus"),
        isRunning: false,
        focusCyclesCompleted: 0,
    };
}

// Diminui 1 segundo se estiver rodando
export function tick(state: PomodoroState): PomodoroState {
    if (!state.isRunning) return state;
    return { ...state, secondsLeft: Math.max(0, state.secondsLeft - 1) };
}

// Controla a transição entre foco e pausas
export function nextPhase(
    state: PomodoroState,
    config: PomodoroConfig
): PomodoroState {
    // Se estava em foco, vai para pausa (curta ou longa)
    if (state.phase === "focus") {
        const nextCycles = state.focusCyclesCompleted + 1;
        const isLong = nextCycles % config.cyclesUntilLongBreak === 0;
        const next: PomodoroPhase = isLong ? "longBreak" : "shortBreak";

        return {
            phase: next,
            secondsLeft: getPhaseSeconds(config, next),
            isRunning: false, // não inicia automaticamente (transição mais gentil)
            focusCyclesCompleted: nextCycles,
        };
    }

    // Se estava em pausa, volta para foco
    return {
        phase: "focus",
        secondsLeft: getPhaseSeconds(config, "focus"),
        isRunning: false,
        focusCyclesCompleted: state.focusCyclesCompleted,
    };
}
