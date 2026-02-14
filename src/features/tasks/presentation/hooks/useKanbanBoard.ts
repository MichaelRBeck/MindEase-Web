"use client";

import * as React from "react";
import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/domain/task";
import type { TasksRepository } from "@/features/tasks/domain/tasksRepository";

type CreateInput = {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    checklist?: { id: string; text: string; done: boolean }[];
};

type UpdatePatch = Partial<Pick<Task, "title" | "description" | "priority" | "status" | "checklist">>;

export function useKanbanBoard(repo: TasksRepository) {
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [loading, setLoading] = React.useState(true);

    const byStatus = React.useMemo<Record<TaskStatus, Task[]>>(() => {
        const cols: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
        for (const t of tasks) cols[t.status].push(t);
        return cols;
    }, [tasks]);

    React.useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const list = await repo.list();
                if (!alive) return;
                setTasks(list.map((t) => ({ ...t, checklist: t.checklist ?? [] })));
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [repo]);

    const add = React.useCallback(
        async (input: CreateInput) => {
            const created = await repo.create({
                title: input.title,
                description: input.description,
                status: input.status,
                priority: input.priority,
                checklist: input.checklist ?? [],
            } as any);
            setTasks((prev) => [{ ...created, checklist: created.checklist ?? [] }, ...prev]);
        },
        [repo]
    );

    const edit = React.useCallback(
        async (id: string, patch: UpdatePatch) => {
            const updated = await repo.update(id, patch as any);
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...updated, checklist: updated.checklist ?? [] } : t)));
        },
        [repo]
    );

    const remove = React.useCallback(
        async (id: string) => {
            await repo.remove(id);
            setTasks((prev) => prev.filter((t) => t.id !== id));
        },
        [repo]
    );

    const move = React.useCallback(
        async (id: string, toStatus: TaskStatus, toIndex: number) => {
            const next = await repo.move(id, toStatus, toIndex);
            setTasks(next.map((t) => ({ ...t, checklist: t.checklist ?? [] })));
        },
        [repo]
    );

    return { byStatus, loading, add, edit, remove, move };
}
