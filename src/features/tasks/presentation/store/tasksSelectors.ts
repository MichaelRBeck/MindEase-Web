import type { RootState } from "@/store";
import type { Task, TaskStatus } from "@/features/tasks/domain/task";

// Seleciona o slice inteiro de tasks
export const selectTasksState = (s: RootState) => s.tasks;

// Retorna apenas a lista de tasks
export const selectTasksItems = (s: RootState): Task[] => s.tasks.items;

// Organiza as tasks em colunas (todo, doing, done)
export const selectTasksByStatus = (
    s: RootState
): Record<TaskStatus, Task[]> => {
    const by: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };

    for (const t of s.tasks.items as Task[]) {
        by[t.status].push(t);
    }

    return by;
};
