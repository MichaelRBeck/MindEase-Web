import type { ReactNode } from "react";
import { RequireAuth } from "@/features/auth/presentation/RequireAuth";
import { AppShellProviders } from "./AppShellProviders";

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <RequireAuth>
            <AppShellProviders>
                {children}
            </AppShellProviders>
        </RequireAuth>
    );
}