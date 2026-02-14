import type { TasksRepository } from "../domain/tasksRepository";
import type { Task } from "../domain/task";

export class TasksService {
    constructor(private repo: TasksRepository) { }

    list() {
        return this.repo.list();
    }

    create(input: Parameters<TasksRepository["create"]>[0]) {
        return this.repo.create(input);
    }

    update(id: string, patch: Parameters<TasksRepository["update"]>[1]) {
        return this.repo.update(id, patch);
    }

    remove(id: string) {
        return this.repo.remove(id);
    }

    move(id: string, toStatus: any, index: number) {
        return this.repo.move(id, toStatus, index);
    }
}
