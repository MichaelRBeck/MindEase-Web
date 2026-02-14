import type { TasksRepository } from "../tasksRepository";
import type { Task } from "../task";

export async function updateTask(
    repo: TasksRepository,
    id: string,
    patch: Partial<Pick<Task, "title" | "description" | "priority" | "status">>
): Promise<Task> {
    if (patch.title !== undefined && !patch.title.trim()) throw new Error("O título é necessário");
    return repo.update(id, {
        ...patch,
        title: patch.title?.trim(),
        description: patch.description?.trim(),
    });
}
