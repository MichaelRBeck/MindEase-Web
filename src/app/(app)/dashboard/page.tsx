import { redirect } from "next/navigation";
import { StoreProvider } from "@/store/StoreProvider";

import { getServerUser } from "@/app/lib/auth/getServerUser";
import { makeAuthTasksPreloadedState } from "@/app/lib/ssr/makeAuthTasksPreloadedState";

import { DashboardPage } from "@/features/dashboard/presentation/pages/DashboardPage";

export default async function Page() {
    // Busca o usuário direto no servidor (SSR)
    const user = await getServerUser();

    // Se não estiver autenticado, redireciona antes de renderizar
    if (!user?.uid) redirect("/auth");

    // Monta o estado inicial já com tarefas do usuário autenticado
    const preloadedState = await makeAuthTasksPreloadedState(user.uid);

    return (
        // Provider recebe o estado pré-carregado para evitar “flash” sem dados
        <StoreProvider preloadedState={preloadedState}>
            <DashboardPage />
        </StoreProvider>
    );
}
