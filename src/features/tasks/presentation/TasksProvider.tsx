"use client";

import * as React from "react";
import { useTasksReduxBoard } from "@/features/tasks/presentation/hooks/useTasksReduxBoard";
import type { Task, TaskStatus } from "@/features/tasks/domain/task";

type TasksBoardContextValue = ReturnType<typeof useTasksReduxBoard>;

const TasksBoardContext = React.createContext<TasksBoardContextValue | null>(null);

export function TasksProvider(props: { children: React.ReactNode }) {
    const board = useTasksReduxBoard();
    return <TasksBoardContext.Provider value={board}>{props.children}</TasksBoardContext.Provider>;
}

export function useTasksBoard() {
    const ctx = React.useContext(TasksBoardContext);
    if (!ctx) throw new Error("useTasksBoard must be used within TasksProvider");
    return ctx;
}

export function getCountsFromByStatus(byStatus: Record<TaskStatus, Task[]>) {
    const todo = byStatus.todo?.length ?? 0;
    const doing = byStatus.doing?.length ?? 0;
    const done = byStatus.done?.length ?? 0;
    const total = todo + doing + done;
    return { total, todo, doing, done };
}
