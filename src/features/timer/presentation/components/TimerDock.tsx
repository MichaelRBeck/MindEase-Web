"use client";

import React from "react";
import { useTimer } from "@/features/timer/presentation/TimerProvider";
import { Play, Pause, SkipForward, Timer as TimerIcon } from "lucide-react";

function formatTime(totalSeconds: number): string {
    const clamped = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(clamped / 60);
    const secs = clamped % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Nome da etapa atual do Pomodoro
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

    // Mostra o dock quando já tem sessão iniciada (mesmo pausada)
    const hasSession = state.secondsLeft !== totalSecondsByPhase;

    if (!state.isRunning && !hasSession) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-[280px] z-50">
            <div className="rounded-2xl shadow-lg bg-white border border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs text-slate-500 inline-flex items-center gap-2">
                        <TimerIcon className="w-4 h-4" aria-hidden="true" />
                        <span>Timer</span>
                    </p>
                    <p className="font-semibold text-slate-800 truncate">
                        {phaseLabel(state.phase)} • {formatTime(state.secondsLeft)}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {state.isRunning ? (
                        <button type="button" className="btn-secondary flex items-center gap-2" onClick={actions.pause}>
                            <Pause className="w-4 h-4" aria-hidden="true" />
                            Pausar
                        </button>
                    ) : (
                        <button type="button" className="btn-secondary flex items-center gap-2" onClick={actions.start}>
                            <Play className="w-4 h-4" aria-hidden="true" />
                            Continuar
                        </button>
                    )}

                    <button type="button" className="btn-ghost flex items-center gap-2" onClick={actions.skip}>
                        <SkipForward className="w-4 h-4" aria-hidden="true" />
                        Pular
                    </button>
                </div>
            </div>
        </div>
    );
}
