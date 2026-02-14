import type { Task, TaskStatus } from "./task";

export interface TasksRepository {
    list(): Promise<Task[]>;
    create(input: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task>;
    update(id: string, patch: Partial<Omit<Task, "id" | "createdAt">>): Promise<Task>;
    remove(id: string): Promise<void>;
    move(id: string, toStatus: TaskStatus, toIndex: number): Promise<Task[]>;
}
