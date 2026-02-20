import type { TasksRepository } from "../tasksRepository";
import type { Task, TaskPriority, TaskStatus } from "../task";

// Input mínimo necessário para criar uma tarefa
export type CreateTaskInput = {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
};

// Use case responsável por validar e delegar criação ao repositório
export async function createTask(
    repo: TasksRepository,
    input: CreateTaskInput
): Promise<Task> {
    // Regra simples: título é obrigatório
    if (!input.title.trim()) throw new Error("O título é necessário");

    return repo.create({
        title: input.title.trim(),
        description: input.description.trim(),
        status: input.status,
        priority: input.priority,
    });
}
