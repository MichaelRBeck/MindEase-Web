import type { TasksRepository } from "../tasksRepository";
import type { TaskStatus } from "../task";

export async function moveTask(repo: TasksRepository, id: string, toStatus: TaskStatus, toIndex: number) {
    return repo.move(id, toStatus, toIndex);
}
