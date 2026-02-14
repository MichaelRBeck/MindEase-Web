import type { Task, TaskStatus } from "@/features/tasks/domain/task";
import type { TasksRepository } from "@/features/tasks/domain/tasksRepository";
import { demoTasks } from "@/features/tasks/data/demoData";

function uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function sortByUpdatedDesc(a: Task, b: Task) {
    return b.updatedAt - a.updatedAt;
}

export class InMemoryTasksRepository implements TasksRepository {
    private tasks: Task[];

    constructor(seed?: Task[]) {
        const now = Date.now();
        this.tasks = (seed ?? (demoTasks as unknown as Task[])).map((t: any) => ({
            ...t,
            checklist: Array.isArray(t.checklist) ? t.checklist : [],
            createdAt: now,
            updatedAt: now,
        }));
    }

    async list(): Promise<Task[]> {
        return [...this.tasks].sort(sortByUpdatedDesc);
    }

    async create(input: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
        const now = Date.now();
        const task: Task = {
            ...input,
            checklist: input.checklist ?? [],
            id: uid(),
            createdAt: now,
            updatedAt: now,
        };
        this.tasks = [task, ...this.tasks];
        return task;
    }

    async update(id: string, patch: Partial<Omit<Task, "id" | "createdAt">>): Promise<Task> {
        const idx = this.tasks.findIndex((t) => t.id === id);
        if (idx < 0) throw new Error("Task not found");

        const next: Task = {
            ...this.tasks[idx],
            ...patch,
            checklist: patch.checklist ?? this.tasks[idx].checklist ?? [],
            updatedAt: Date.now(),
        };

        this.tasks = this.tasks.map((t) => (t.id === id ? next : t));
        return next;
    }

    async remove(id: string): Promise<void> {
        this.tasks = this.tasks.filter((t) => t.id !== id);
    }

    async move(id: string, toStatus: TaskStatus, toIndex: number): Promise<Task[]> {
        const current = this.tasks.find((t) => t.id === id);
        if (!current) throw new Error("Task not found");

        // Remove da lista
        const remaining = this.tasks.filter((t) => t.id !== id);
        const moved: Task = {
            ...current,
            status: toStatus,
            updatedAt: Date.now(),
            checklist: current.checklist ?? [],
        };

        // Reconstroi mantendo a ordem por coluna
        const columns: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
        for (const t of remaining) columns[t.status].push({ ...t, checklist: t.checklist ?? [] });

        const target = columns[toStatus];
        const safeIndex = Math.max(0, Math.min(toIndex, target.length));
        target.splice(safeIndex, 0, moved);

        this.tasks = [...columns.todo, ...columns.doing, ...columns.done];
        return this.tasks;
    }
}
