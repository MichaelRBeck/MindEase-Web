import type { RootState } from "@/store";
import type { Task, TaskStatus } from "@/features/tasks/domain/task";

export const selectTasksState = (s: RootState) => s.tasks;

export const selectTasksItems = (s: RootState): Task[] => s.tasks.items;

export const selectTasksByStatus = (s: RootState): Record<TaskStatus, Task[]> => {
    const by: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };

    for (const t of s.tasks.items as Task[]) {
        by[t.status].push(t);
    }

    return by;
};
