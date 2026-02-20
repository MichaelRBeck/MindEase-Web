// Tipos simplificados usados apenas para dados de demonstração
export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type DemoTask = {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
};

// Conjunto fixo de tarefas para mock / fallback visual
export const demoTasks: DemoTask[] = [
    {
        id: "1",
        title: "Morning meditation",
        description: "Take 10 minutes to breathe and center yourself",
        status: "done",
        priority: "low",
    },
    {
        id: "2",
        title: "Review project notes",
        description: "Go through yesterday's meeting notes",
        status: "doing",
        priority: "medium",
    },
    {
        id: "3",
        title: "Take a walk",
        description: "Gentle movement, 15-20 minutes",
        status: "todo",
        priority: "low",
    },
    {
        id: "4",
        title: "Complete task report",
        description: "Finish the weekly summary",
        status: "todo",
        priority: "medium",
    },
    {
        id: "5",
        title: "Call friend",
        description: "Check in with Sarah",
        status: "todo",
        priority: "low",
    },
];

// Filtra tarefas por coluna (simula comportamento do Kanban)
export function getDemoTasksByStatus(status: TaskStatus): DemoTask[] {
    return demoTasks.filter((task) => task.status === status);
}

// Retorna contagem simples para cards/resumo do dashboard
export function getDemoTasksCount(): {
    total: number;
    todo: number;
    doing: number;
    done: number;
} {
    return {
        total: demoTasks.length,
        todo: demoTasks.filter((t) => t.status === "todo").length,
        doing: demoTasks.filter((t) => t.status === "doing").length,
        done: demoTasks.filter((t) => t.status === "done").length,
    };
}
