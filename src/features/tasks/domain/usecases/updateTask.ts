import type { TasksRepository } from "../tasksRepository";
import type { Task } from "../task";

// Use case para atualizar dados principais da tarefa
export async function updateTask(
    repo: TasksRepository,
    id: string,
    patch: Partial<Pick<Task, "title" | "description" | "priority" | "status">>
): Promise<Task> {
    // Se o título vier no patch, valida antes de salvar
    if (patch.title !== undefined && !patch.title.trim())
        throw new Error("O título é necessário");

    return repo.update(id, {
        ...patch,
        title: patch.title?.trim(),
        description: patch.description?.trim(),
    });
}
