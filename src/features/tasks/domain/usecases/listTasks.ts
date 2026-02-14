import type { TasksRepository } from "../tasksRepository";

export async function listTasks(repo: TasksRepository) {
    return repo.list();
}
