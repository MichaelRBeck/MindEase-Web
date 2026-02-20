import { redirect } from "next/navigation";
import { StoreProvider } from "@/store/StoreProvider";

import { getServerUser } from "@/app/lib/auth/getServerUser";
import { makeAuthTasksPreloadedState } from "@/app/lib/ssr/makeAuthTasksPreloadedState";

import { TasksPage } from "@/features/tasks/presentation/pages/TasksPage";

export default async function Page() {
    // Validação de autenticação já no servidor
    const user = await getServerUser();

    // Se não tiver usuário, bloqueia acesso direto à rota
    if (!user?.uid) redirect("/auth");

    // Carrega as tarefas do usuário antes da renderização (SSR)
    const preloadedState = await makeAuthTasksPreloadedState(user.uid);

    return (
        // Injeta o estado inicial no Store para já renderizar com dados
        <StoreProvider preloadedState={preloadedState}>
            <TasksPage />
        </StoreProvider>
    );
}
