"use client";

import type { ReactNode } from "react";

import { Sidebar } from "@/features/navigation/presentation/components/Sidebar";
import { FocusDock } from "@/features/navigation/presentation/components/FocusDock";
import { TimerProvider } from "@/features/timer/presentation/TimerProvider";
import { TimerDock } from "@/features/timer/presentation/components/TimerDock";
import { TransitionProvider } from "@/features/transitions/presentation/TransitionProvider";
import { TransitionToast } from "@/features/transitions/presentation/components/TransitionToast";
import { TasksProvider } from "@/features/tasks/presentation/TasksProvider";

export function AppShellProviders({ children }: { children: ReactNode }) {
    return (
        <TransitionProvider>
            <TimerProvider>
                <TasksProvider>
                    <div className="min-h-screen bg-[#F4F4F9] app-shell">
                        <Sidebar />
                        <FocusDock />
                        <TimerDock />
                        <TransitionToast />
                        <div className="min-h-screen md:pl-64 pb-24 md:pb-0 app-content">{children}</div>
                    </div>
                </TasksProvider>
            </TimerProvider>
        </TransitionProvider>
    );
}
