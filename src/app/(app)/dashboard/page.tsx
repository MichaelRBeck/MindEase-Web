import { redirect } from "next/navigation";
import { StoreProvider } from "@/store/StoreProvider";

import { getServerUser } from "@/app/lib/auth/getServerUser";
import { makeAuthTasksPreloadedState } from "@/app/lib/ssr/makeAuthTasksPreloadedState";

import { DashboardPage } from "@/features/dashboard/presentation/pages/DashboardPage";

export default async function Page() {
    const user = await getServerUser();
    if (!user?.uid) redirect("/auth");

    const preloadedState = await makeAuthTasksPreloadedState(user.uid);

    return (
        <StoreProvider preloadedState={preloadedState}>
            <DashboardPage />
        </StoreProvider>
    );
}
