import type { Task, TaskStatus } from "./task";

// Contrato que define como o domínio conversa com a fonte de dados
// Pode ser Firebase, memória, etc.
export interface TasksRepository {
    // Lista todas as tarefas do usuário
    list(): Promise<Task[]>;

    // Cria nova tarefa (id e timestamps são responsabilidade do repo)
    create(input: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task>;

    // Atualiza parcialmente uma tarefa existente
    update(id: string, patch: Partial<Omit<Task, "id" | "createdAt">>): Promise<Task>;

    // Remove tarefa pelo id
    remove(id: string): Promise<void>;

    // Move tarefa entre colunas e ajusta posição
    move(id: string, toStatus: TaskStatus, toIndex: number): Promise<Task[]>;
}
