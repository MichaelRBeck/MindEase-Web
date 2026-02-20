import "server-only";
import type { Task, TaskStatus } from "@/features/tasks/domain/task";
import { adminDb } from "@/app/lib/firebase/admin";

// Garante que o status vindo do banco sempre seja válido
function normalizeStatus(s: unknown): TaskStatus {
    return s === "doing" || s === "done" ? s : "todo";
}

export async function adminListTasks(uid: string): Promise<Task[]> {
    // Busca tarefas do usuário já ordenadas por atualização (mais recentes primeiro)
    const snap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("tasks")
        .orderBy("updatedAt", "desc")
        .get();

    // Normaliza os dados para garantir tipagem consistente no domínio
    return snap.docs.map((d) => {
        const data = d.data() as Partial<Task> & Record<string, unknown>;

        return {
            id: (data.id as string) ?? d.id,
            title: String(data.title ?? ""),
            description: String(data.description ?? ""),
            status: normalizeStatus(data.status),
            priority: (data.priority as Task["priority"]) ?? "medium",
            checklist: Array.isArray(data.checklist) ? (data.checklist as Task["checklist"]) : [],
            createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now(),
            updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : Date.now(),

            // Campo opcional usado para ordenação manual no Kanban
            ...(typeof (data as any).order === "number"
                ? { order: (data as any).order }
                : {}),
        } as Task;
    });
}
