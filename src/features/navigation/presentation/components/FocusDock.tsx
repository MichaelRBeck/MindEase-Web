"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCognitive } from "@/features/cognitive/presentation/CognitiveProvider";
import { useTimer } from "@/features/timer/presentation/TimerProvider";

type NavItem = { href: string; label: string; icon: string };

const ITEMS: readonly NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/tasks", label: "Tasks", icon: "📋" },
    { href: "/timer", label: "Timer", icon: "⏱️" },
    { href: "/panel", label: "Panel", icon: "🧠" },
] as const;

export function FocusDock() {
    const pathname = usePathname();
    const cognitive = useCognitive();

    const focusMode = cognitive.applied.focusMode;
    const [open, setOpen] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const { state, config } = useTimer();

    React.useEffect(() => {
        if (!focusMode) setOpen(false);
    }, [focusMode]);

    React.useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    const totalSecondsByPhase =
        state.phase === "focus"
            ? config.focusMinutes * 60
            : state.phase === "shortBreak"
                ? config.shortBreakMinutes * 60
                : config.longBreakMinutes * 60;

    const hasTimerSession = state.secondsLeft !== totalSecondsByPhase;
    const timerVisible = state.isRunning || hasTimerSession;

    const dockBottom = timerVisible ? "bottom-28" : "bottom-6";

    async function exitFocusMode() {
        setBusy(true);
        try {
            await cognitive.applyPatch({ focusMode: false });
            setOpen(false);
        } finally {
            setBusy(false);
        }
    }


    if (!focusMode) return null;

    return (
        <>
            {open && (
                <button
                    type="button"
                    aria-label="Close focus menu"
                    className="fixed inset-0 z-[70] bg-black/20"
                    onClick={() => setOpen(false)}
                />
            )}

            <div className={`fixed ${dockBottom} right-6 z-[80] flex flex-col items-end gap-3`}>
                {open && (
                    <nav
                        aria-label="Focus navigation"
                        className="w-[260px] bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-md p-3"
                    >
                        <div className="px-3 py-2">
                            <p className="text-sm font-bold text-[#2C3E50]">Focus Menu</p>
                            <p className="text-xs text-[#546E7A]">Quick navigation</p>
                        </div>

                        <div className="flex flex-col gap-2 p-2">
                            {ITEMS.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors ${active ? "bg-[#005A9C] text-white" : "text-[#2C3E50] hover:bg-slate-100"
                                            }`}
                                    >
                                        <span className="text-xl" aria-hidden="true">
                                            {item.icon}
                                        </span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="p-2 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                className="w-full btn-secondary"
                                onClick={() => void exitFocusMode()}
                                disabled={busy}
                            >
                                {busy ? "Exiting..." : "Exit Focus Mode"}
                            </button>
                        </div>
                    </nav>
                )}

                <button
                    type="button"
                    data-testid="focus-menu-btn"
                    className="btn-primary px-6 py-3 shadow-lg"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                >
                    {open ? "Close" : "Menu"}
                </button>
            </div>
        </>
    );
}
