// Estados possíveis dentro do board (Kanban)
export type TaskStatus = "todo" | "doing" | "done";

// Nível de prioridade visual e lógica
export type TaskPriority = "low" | "medium" | "high";

// Entidade principal de tarefa do domínio
export type Task = {
    id: string; // Identificador único (Firestore ou local)

    title: string; // Título curto e obrigatório
    description: string; // Descrição opcional/explicativa

    status: TaskStatus; // Coluna atual no board
    priority: TaskPriority; // Nível de importância

    createdAt: number; // Timestamp (ms)
    updatedAt: number; // Timestamp (ms)

    // Checklist opcional para dividir a tarefa em passos menores
    // Ajuda a reduzir sobrecarga cognitiva
    checklist?: { id: string; text: string; done: boolean }[];
};
