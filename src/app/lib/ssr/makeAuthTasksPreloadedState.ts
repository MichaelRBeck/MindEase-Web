import "server-only";
import type { RootState } from "@/store/makeStore";
import { adminListTasks } from "@/features/tasks/data/adminListTasks";

// Monta o estado inicial apenas com auth + tasks
export async function makeAuthTasksPreloadedState(uid: string): Promise<RootState> {
    // Busca tarefas do usuário direto no Firestore via Admin (SSR)
    const tasks = await adminListTasks(uid);

    // Log simples só para demonstrar que está vindo do servidor
    console.log("SSR hidratando auth e tasks para usuário:", uid);

    return {
        auth: { uid, status: "authenticated" },

        // Tasks já chegam prontas no client pra evitar carregamento incial
        tasks: {
            uid,
            items: tasks,
            loading: false,
            error: null,
            hydrated: true,
        },
    } as RootState;
}
