import type { TasksRepository } from "../tasksRepository";

export async function deleteTask(repo: TasksRepository, id: string): Promise<void> {
    return repo.remove(id);
}
