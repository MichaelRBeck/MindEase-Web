import type { TasksRepository } from "../domain/tasksRepository";
import type { TaskStatus } from "../domain/task";

// Camada de serviço: centraliza chamadas do repo (fica fácil trocar Firebase/InMemory)
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

    // Move uma task de coluna e opcionalmente ajusta a posição
    move(id: string, toStatus: TaskStatus, index: number) {
        return this.repo.move(id, toStatus, index);
    }
}
