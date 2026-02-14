import type { TasksRepository } from "../tasksRepository";
import type { Task, TaskPriority, TaskStatus } from "../task";

export type CreateTaskInput = {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
};

export async function createTask(repo: TasksRepository, input: CreateTaskInput): Promise<Task> {
    if (!input.title.trim()) throw new Error("O título é necessário");
    return repo.create({
        title: input.title.trim(),
        description: input.description.trim(),
        status: input.status,
        priority: input.priority,
    });
}
