"use client";

import React from "react";
import { useTransition } from "@/features/transitions/presentation/TransitionProvider";
import { useCognitive } from "@/features/cognitive/presentation/CognitiveProvider";
import { useTimer } from "@/features/timer/presentation/TimerProvider";

export function TransitionToast() {
    const { current, dismiss } = useTransition();
    const { applied } = useCognitive();
    const { state, config } = useTimer();

    if (!current) return null;

    const focusMode = applied.focusMode;
    const tone = current.tone ?? "info";

    const toneCls =
        tone === "success"
            ? "border-[#2E7D32]/20 bg-[#E8F5E9]"
            : "border-[#005A9C]/20 bg-[#E1F5FE]";

    const totalSecondsByPhase =
        state.phase === "focus"
            ? config.focusMinutes * 60
            : state.phase === "shortBreak"
                ? config.shortBreakMinutes * 60
                : config.longBreakMinutes * 60;

    const hasTimerSession = state.secondsLeft !== totalSecondsByPhase;
    const timerVisible = state.isRunning || hasTimerSession;

    // se timer visível, sobe o toast
    const bottomClass = timerVisible ? "bottom-24" : "bottom-4";

    return (
        <div className={`fixed ${bottomClass} left-4 right-4 md:left-[280px] z-[90]`}>
            <div
                className={`rounded-2xl shadow-lg border px-4 py-3 flex items-center justify-between gap-3 ${toneCls}`}
                role="status"
                aria-live="polite"
            >
                <div className="min-w-0">
                    <p className="text-xs text-[#546E7A]">Transição</p>
                    <p className="font-medium text-[#2C3E50] truncate">{current.message}</p>
                </div>

                <div className="flex items-center gap-2">
                    {current.actionLabel && current.onAction && (
                        <button
                            type="button"
                            className={focusMode ? "btn-ghost" : "btn-secondary"}
                            onClick={() => current.onAction?.()}
                        >
                            {current.actionLabel}
                        </button>
                    )}

                    <button type="button" className="btn-ghost" onClick={dismiss} aria-label="Fechar aviso">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
