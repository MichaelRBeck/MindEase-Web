"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const status = useAppSelector((s) => s.auth.status);

    // Se estiver anônimo, joga pra tela de login e guarda o "next"
    React.useEffect(() => {
        if (status === "anonymous") {
            router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
        }
    }, [status, router, pathname]);

    // Loading enquanto o Firebase/SSR ainda não definiu status
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#F4F4F9] flex items-center justify-center px-6">
                <p className="text-sm text-[#546E7A]">Carregando…</p>
            </div>
        );
    }

    // Evita renderizar conteúdo enquanto redireciona
    if (status === "anonymous") return null;

    return <>{children}</>;
}
