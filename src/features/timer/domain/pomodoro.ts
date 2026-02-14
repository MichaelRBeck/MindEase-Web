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
    focusCyclesCompleted: number; // conta quantos focos completos já fez no “bloco”
};

export function getPhaseSeconds(config: PomodoroConfig, phase: PomodoroPhase): number {
    const minutes =
        phase === "focus"
            ? config.focusMinutes
            : phase === "shortBreak"
                ? config.shortBreakMinutes
                : config.longBreakMinutes;
    return Math.max(1, Math.round(minutes * 60));
}

export function createInitialPomodoro(config: PomodoroConfig): PomodoroState {
    return {
        phase: "focus",
        secondsLeft: getPhaseSeconds(config, "focus"),
        isRunning: false,
        focusCyclesCompleted: 0,
    };
}

export function toggleRun(state: PomodoroState, running: boolean): PomodoroState {
    return { ...state, isRunning: running };
}

export function resetPomodoro(state: PomodoroState, config: PomodoroConfig): PomodoroState {
    return {
        phase: "focus",
        secondsLeft: getPhaseSeconds(config, "focus"),
        isRunning: false,
        focusCyclesCompleted: 0,
    };
}

export function tick(state: PomodoroState): PomodoroState {
    if (!state.isRunning) return state;
    return { ...state, secondsLeft: Math.max(0, state.secondsLeft - 1) };
}

export function nextPhase(state: PomodoroState, config: PomodoroConfig): PomodoroState {
    // chama quando secondsLeft chega em 0, ou quando usuário “skip”
    if (state.phase === "focus") {
        const nextCycles = state.focusCyclesCompleted + 1;
        const isLong = nextCycles % config.cyclesUntilLongBreak === 0;
        const next: PomodoroPhase = isLong ? "longBreak" : "shortBreak";
        return {
            phase: next,
            secondsLeft: getPhaseSeconds(config, next),
            isRunning: false, // transição gentil: não auto-inicia
            focusCyclesCompleted: nextCycles,
        };
    }

    // break -> focus
    return {
        phase: "focus",
        secondsLeft: getPhaseSeconds(config, "focus"),
        isRunning: false,
        focusCyclesCompleted: state.focusCyclesCompleted,
    };
}
