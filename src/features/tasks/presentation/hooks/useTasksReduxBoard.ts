import * as React from "react";
import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/domain/task";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    clearTasks,
    createTask,
    fetchTasks,
    moveTask,
    removeTask,
    updateTask,
} from "@/features/tasks/presentation/store/tasksSlice";

export type CreateTaskInput = {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    checklist?: { id: string; text: string; done: boolean }[];
};

// Hook que conecta o Kanban direto com o Redux
export function useTasksReduxBoard() {
    // UID atual autenticado
    const uid = useAppSelector((s) => s.auth.uid);

    // UID que já está salvo no slice de tasks
    const tasksUid = useAppSelector((s) => s.tasks.uid);

    const dispatch = useAppDispatch();
    const { loading, error, hydrated } = useAppSelector((s) => s.tasks);
    const items = useAppSelector((s) => s.tasks.items) as Task[];

    React.useEffect(() => {
        // Se não tem usuário, limpa tudo
        if (!uid) {
            dispatch(clearTasks());
            return;
        }

        // Se trocou de usuário, limpa e busca novamente
        if (tasksUid !== uid) {
            dispatch(clearTasks());
            void dispatch(fetchTasks({ uid }));
            return;
        }

        // Se ainda não hidratou, busca tasks
        if (!hydrated) {
            void dispatch(fetchTasks({ uid }));
        }
    }, [uid, tasksUid, hydrated, dispatch]);

    // Organiza as tasks por coluna do Kanban
    const byStatus = React.useMemo(() => {
        const map: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
        for (const t of items) map[t.status].push(t);
        return map;
    }, [items]);

    async function create(input: CreateTaskInput) {
        if (!uid) return;
        await dispatch(createTask({ uid, input })).unwrap();
    }

    async function update(id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) {
        if (!uid) return;
        await dispatch(updateTask({ uid, id, patch })).unwrap();
    }

    async function remove(id: string) {
        if (!uid) return;
        await dispatch(removeTask({ uid, id })).unwrap();
    }

    async function move(id: string, toStatus: TaskStatus, toIndex: number) {
        if (!uid) return;
        await dispatch(moveTask({ uid, id, toStatus, toIndex })).unwrap();
    }

    return {
        items,
        byStatus,
        loading,
        error,
        hydrated,
        add: create,
        edit: update,
        remove,
        move,

        // Expõe também como actions caso precise usar direto
        actions: { create, update, remove, move },
    };
}
