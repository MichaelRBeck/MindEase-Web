import type { TasksRepository } from "../tasksRepository";

// Use case simples para remover uma tarefa pelo id
export async function deleteTask(
    repo: TasksRepository,
    id: string
): Promise<void> {
    return repo.remove(id);
}
