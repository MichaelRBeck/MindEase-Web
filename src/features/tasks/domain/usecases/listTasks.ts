import type { TasksRepository } from "../tasksRepository";

// Use case responsável por listar todas as tarefas do usuário
export async function listTasks(repo: TasksRepository) {
    return repo.list();
}
