/* eslint-disable @typescript-eslint/no-explicit-any */
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

// Hook que encapsula a lógica do board e conecta com o repository
export function useKanbanBoard(repo: TasksRepository) {
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Organiza as tarefas por coluna (todo / doing / done)
    const byStatus = React.useMemo<Record<TaskStatus, Task[]>>(() => {
        const cols: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
        for (const t of tasks) cols[t.status].push(t);
        return cols;
    }, [tasks]);

    // Carrega tarefas ao montar ou quando o repo muda
    React.useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);
            try {
                const list = await repo.list();
                if (!alive) return;

                // Garante que checklist nunca seja undefined
                setTasks(list.map((t) => ({ ...t, checklist: t.checklist ?? [] })));
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [repo]);

    // Cria nova tarefa e adiciona no topo
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

    // Atualiza tarefa existente
    const edit = React.useCallback(
        async (id: string, patch: UpdatePatch) => {
            const updated = await repo.update(id, patch as any);

            setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...updated, checklist: updated.checklist ?? [] } : t))
            );
        },
        [repo]
    );

    // Remove tarefa do estado após deletar no repo
    const remove = React.useCallback(
        async (id: string) => {
            await repo.remove(id);
            setTasks((prev) => prev.filter((t) => t.id !== id));
        },
        [repo]
    );

    // Move tarefa (drag and drop) e sincroniza lista inteira
    const move = React.useCallback(
        async (id: string, toStatus: TaskStatus, toIndex: number) => {
            const next = await repo.move(id, toStatus, toIndex);
            setTasks(next.map((t) => ({ ...t, checklist: t.checklist ?? [] })));
        },
        [repo]
    );

    return { byStatus, loading, add, edit, remove, move };
}
