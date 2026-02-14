"use client";

import * as React from "react";
import { useCognitiveAlert } from "@/features/cognitive/presentation/hooks/useCognitiveAlert";
import { CognitiveAlertBanner } from "@/features/cognitive/presentation/components/CognitiveAlertBanner";
import { useTimer } from "@/features/timer/presentation/TimerProvider";
import type { PomodoroPhase } from "@/features/timer/domain/pomodoro";
import { useCognitive } from "@/features/cognitive/presentation/CognitiveProvider";

const DURATIONS: readonly number[] = [2, 10, 15, 25, 30, 45] as const;

function formatTime(totalSeconds: number): string {
    const clamped = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(clamped / 60);
    const secs = clamped % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function phaseLabel(phase: PomodoroPhase): string {
    if (phase === "focus") return "Foco";
    if (phase === "shortBreak") return "Pausa curta";
    return "Pausa longa";
}

function phaseHint(phase: PomodoroPhase): string {
    if (phase === "focus") return "Foque em uma coisa por vez";
    if (phase === "shortBreak") return "Faça uma pausa curta e gentil";
    return "Hora de uma pausa maior para recuperar energia";
}

export function TimerPage() {
    const { applied } = useCognitive();
    const animationsOn = applied.animationsEnabled;

    // ✅ estado global (persistente) vindo do Provider
    const { state, actions, config, setFocusMinutes } = useTimer();

    const alert = useCognitiveAlert({
        key: "timer",
        message: "Você está focando há um tempo. Quer fazer uma pausa curta ou ajustar a duração?",
    });

    const totalSecondsByPhase = React.useMemo(() => {
        const minutes =
            state.phase === "focus"
                ? config.focusMinutes
                : state.phase === "shortBreak"
                    ? config.shortBreakMinutes
                    : config.longBreakMinutes;

        return Math.max(1, Math.round(minutes * 60));
    }, [state.phase, config]);

    const progress =
        totalSecondsByPhase > 0 ? ((totalSecondsByPhase - state.secondsLeft) / totalSecondsByPhase) * 100 : 0;

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress / 100);

    function selectFocusDuration(min: number) {
        setFocusMinutes(min);
    }

    const isBreak = state.phase !== "focus";

    return (
        <main data-testid="timer-container" className="min-h-screen bg-[#F4F4F9] flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full mx-auto space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50]">Focus Timer</h1>
                    <p className="text-lg text-[#546E7A]">
                        {phaseHint(state.phase)} • {phaseLabel(state.phase)}
                    </p>
                </header>

                <section className="card space-y-8">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative w-64 h-64">
                            <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
                                <circle cx="128" cy="128" r={radius} stroke="#E1F5FE" strokeWidth="16" fill="none" />

                                <circle
                                    data-testid="timer-progress-circle"
                                    cx="128"
                                    cy="128"
                                    r={radius}
                                    stroke={isBreak ? "#2E7D32" : "#005A9C"}
                                    strokeWidth="16"
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashOffset}
                                    className={
                                        animationsOn
                                            ? "transition-all duration-1000 ease-linear"
                                            : "transition-none"
                                    }
                                />
                            </svg>

                            <div className="absolute inset-0 flex items-center justify-center">
                                <span data-testid="timer-display" className="text-5xl font-bold text-[#2C3E50]" aria-live="polite">
                                    {formatTime(state.secondsLeft)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4 flex-wrap justify-center">
                            {!state.isRunning ? (
                                <button data-testid="timer-start-btn" onClick={actions.start} className="btn-primary" type="button">
                                    Start
                                </button>
                            ) : (
                                <button data-testid="timer-pause-btn" onClick={actions.pause} className="btn-secondary" type="button">
                                    Pause
                                </button>
                            )}

                            <button data-testid="timer-reset-btn" onClick={actions.reset} className="btn-ghost" type="button">
                                Reset
                            </button>

                            <button data-testid="timer-skip-btn" onClick={actions.skip} className="btn-ghost" type="button">
                                Pular etapa
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm font-medium text-[#2C3E50]">Duração do foco (minutos)</p>

                        <div className="flex gap-2 flex-wrap">
                            {DURATIONS.map((min) => (
                                <button
                                    key={min}
                                    data-testid={`timer-duration-${min}`}
                                    onClick={() => selectFocusDuration(min)}
                                    type="button"
                                    className={`px-4 py-2 rounded-full font-medium ${animationsOn ? "transition-colors" : ""
                                        } ${config.focusMinutes === min && state.phase === "focus"
                                            ? "bg-[#005A9C] text-white"
                                            : "bg-white border-2 border-slate-200 text-[#2C3E50] hover:border-[#005A9C]"
                                        }`}
                                >
                                    {min}
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-[#546E7A]">
                            Pausa curta: {config.shortBreakMinutes} min • Pausa longa: {config.longBreakMinutes} min • Longa a cada{" "}
                            {config.cyclesUntilLongBreak} focos
                        </p>
                    </div>

                    <div className="bg-[#FFF8E1] border border-[#FFBF00]/30 rounded-2xl p-4">
                        <p className="text-sm text-[#2C3E50] leading-relaxed">
                            💡 Este Pomodoro é gentil: ao terminar uma etapa, ele sugere a próxima, mas não inicia sozinho.
                        </p>
                    </div>
                </section>
            </div>

            <CognitiveAlertBanner visible={alert.visible} message={alert.message} onDismiss={alert.dismiss} onSnooze={alert.snooze} />
        </main>
    );
}
