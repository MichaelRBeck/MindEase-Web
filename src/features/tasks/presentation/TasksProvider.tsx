"use client";

import * as React from "react";
import { useTasksReduxBoard } from "@/features/tasks/presentation/hooks/useTasksReduxBoard";
import type { Task, TaskStatus } from "@/features/tasks/domain/task";

// Context que expõe o estado e ações do board (Redux)
type TasksBoardContextValue = ReturnType<typeof useTasksReduxBoard>;

const TasksBoardContext = React.createContext<TasksBoardContextValue | null>(null);

export function TasksProvider(props: { children: React.ReactNode }) {
    // Hook central que conecta UI com o slice de tasks
    const board = useTasksReduxBoard();

    return (
        <TasksBoardContext.Provider value={board}>
            {props.children}
        </TasksBoardContext.Provider>
    );
}

export function useTasksBoard() {
    const ctx = React.useContext(TasksBoardContext);

    // Garante que o hook só seja usado dentro do Provider
    if (!ctx) throw new Error("useTasksBoard precisa ser usado com TasksProvider");

    return ctx;
}

// Helper simples para calcular totais por coluna
export function getCountsFromByStatus(byStatus: Record<TaskStatus, Task[]>) {
    const todo = byStatus.todo?.length ?? 0;
    const doing = byStatus.doing?.length ?? 0;
    const done = byStatus.done?.length ?? 0;
    const total = todo + doing + done;

    return { total, todo, doing, done };
}
