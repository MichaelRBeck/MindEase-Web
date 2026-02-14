"use client";

import React from "react";
import { useTimer } from "@/features/timer/presentation/TimerProvider";

function formatTime(totalSeconds: number): string {
    const clamped = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(clamped / 60);
    const secs = clamped % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function phaseLabel(phase: string) {
    if (phase === "focus") return "Foco";
    if (phase === "shortBreak") return "Pausa curta";
    return "Pausa longa";
}

export function TimerDock() {
    const { state, actions, config } = useTimer();

    const totalSecondsByPhase =
        state.phase === "focus"
            ? config.focusMinutes * 60
            : state.phase === "shortBreak"
                ? config.shortBreakMinutes * 60
                : config.longBreakMinutes * 60;

    // ✅ aparece quando:
    // - rodando OU
    // - já começou a sessão (pausado mas com progresso)
    const hasSession = state.secondsLeft !== totalSecondsByPhase;

    if (!state.isRunning && !hasSession) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-[280px] z-50">
            <div className="rounded-2xl shadow-lg bg-white border border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs text-slate-500">Timer</p>
                    <p className="font-semibold text-slate-800 truncate">
                        {phaseLabel(state.phase)} • {formatTime(state.secondsLeft)}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {state.isRunning ? (
                        <button type="button" className="btn-secondary" onClick={actions.pause}>
                            Pausar
                        </button>
                    ) : (
                        <button type="button" className="btn-secondary" onClick={actions.start}>
                            Continuar
                        </button>
                    )}

                    <button type="button" className="btn-ghost" onClick={actions.skip}>
                        Pular
                    </button>
                </div>
            </div>
        </div>
    );
}
