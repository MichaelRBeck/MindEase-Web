import "server-only";
import type { RootState } from "@/store/makeStore";
import { adminListTasks } from "@/features/tasks/data/adminListTasks";

export async function makeAuthTasksPreloadedState(uid: string): Promise<RootState> {
    const tasks = await adminListTasks(uid);

    // Log para demonstração do SSR
    console.log("SSR Hidratando auth e tasks para usuário:", uid);

    return {
        auth: { uid, status: "authenticated" },
        tasks: {
            uid,
            items: tasks,
            loading: false,
            error: null,
            hydrated: true,
        },
    } as RootState;
}
