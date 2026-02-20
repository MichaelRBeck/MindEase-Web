"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCognitive } from "@/features/cognitive/presentation/CognitiveProvider";
import { useUserProfile } from "@/features/profile/presentation/hooks/useUserProfile";
import { Brain, Home, ListTodo, Timer, User, Settings } from "lucide-react";

type NavItem = {
    path: string;
    label: string;
    shortLabel?: string;
    Icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: readonly NavItem[] = [
    { path: "/dashboard", label: "Início", shortLabel: "Início", Icon: Home },
    { path: "/panel", label: "Painel cognitivo", shortLabel: "Painel", Icon: Brain },
    { path: "/tasks", label: "Tarefas", shortLabel: "Tarefas", Icon: ListTodo },
    { path: "/timer", label: "Timer", shortLabel: "Timer", Icon: Timer },
    { path: "/profile", label: "Perfil", shortLabel: "Perfil", Icon: User },
    { path: "/settings", label: "Configurações", shortLabel: "Ajustes", Icon: Settings },
] as const;

function isActivePath(pathname: string, itemPath: string) {
    return pathname === itemPath;
}

// Filtra itens de navegação dependendo do perfil
function getNavItemsForProfile(profile: "simple" | "guided" | "power"): readonly NavItem[] {
    if (profile === "simple") {
        return NAV_ITEMS.filter((i) => ["/dashboard", "/tasks", "/timer", "/settings"].includes(i.path));
    }
    return NAV_ITEMS;
}

function profileBadge(profile: "simple" | "guided" | "power") {
    if (profile === "simple") return { text: "Navegação simples", cls: "bg-[#E8F5E9] text-[#2E7D32]" };
    if (profile === "guided") return { text: "Navegação guiada", cls: "bg-[#E1F5FE] text-[#005A9C]" };
    return { text: "Navegação avançada", cls: "bg-[#FFF8E1] text-[#8A6D00]" };
}

export function Sidebar() {
    const pathname = usePathname();
    const { applied } = useCognitive();
    const { profile } = useUserProfile();

    const navProfile = profile.navigationProfile;
    const items = getNavItemsForProfile(navProfile);
    const badge = profileBadge(navProfile);

    const useShortLabels = navProfile === "simple";

    // Modo foco esconde a sidebar
    if (applied.focusMode) return null;

    return (
        <>
            {/* Sidebar web */}
            <nav
                data-testid="desktop-navigation"
                aria-label="Principal"
                className={[
                    "hidden md:flex fixed left-0 top-0 h-screen w-64 backdrop-blur-xl border-r border-slate-100 p-6 flex-col gap-2 z-40",
                    navProfile === "simple" ? "bg-white" : "bg-white/80",
                ].join(" ")}
            >
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#005A9C]">MindEase</h2>
                    <p className="text-sm text-[#546E7A] mt-1">Seu espaço calmo</p>

                    <div className="mt-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${badge.cls}`}>
                            {badge.text}
                        </span>
                    </div>

                    <p className="text-xs text-[#546E7A] mt-2 leading-relaxed">
                        {navProfile === "simple" && "Menos opções na tela para reduzir sobrecarga."}
                        {navProfile === "guided" && "Navegação completa com orientação leve."}
                        {navProfile === "power" && "Navegação completa + atalhos rápidos."}
                    </p>
                </div>

                {navProfile === "power" && (
                    <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-3">
                        <p className="text-xs font-bold text-[#2C3E50] mb-2">Ações rápidas</p>
                        <div className="flex flex-col gap-2">
                            <Link className="btn-secondary text-left" href="/tasks">
                                + Adicionar tarefa
                            </Link>
                            <Link className="btn-secondary text-left" href="/timer">
                                Iniciar timer
                            </Link>
                            <Link className="btn-ghost text-left" href="/panel">
                                Ajustar painel cognitivo
                            </Link>
                        </div>
                    </div>
                )}

                {navProfile === "guided" && (
                    <div className="mb-4 rounded-2xl border border-[#005A9C]/15 bg-[#E1F5FE] p-3">
                        <p className="text-xs font-bold text-[#2C3E50]">Dica</p>
                        <p className="text-xs text-[#546E7A] leading-relaxed mt-1">
                            Se ficar pesado, troque para <strong>Simples</strong> e ative o <strong>Modo foco</strong>.
                        </p>
                    </div>
                )}

                {items.map((item) => {
                    const active = isActivePath(pathname, item.path);
                    const label = useShortLabels ? item.shortLabel ?? item.label : item.label;
                    const Icon = item.Icon;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            data-testid={`nav-${item.label.toLowerCase()}`}
                            aria-current={active ? "page" : undefined}
                            className={[
                                "flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors text-left",
                                active ? "bg-[#005A9C] text-white" : "text-[#2C3E50] hover:bg-slate-100",
                                navProfile === "simple" ? "text-sm" : "",
                            ].join(" ")}
                        >
                            <Icon className="w-5 h-5" aria-hidden="true" />
                            <span>{label}</span>
                        </Link>
                    );
                })}

                {navProfile === "simple" && (
                    <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                        <Link href="/profile" className="btn-ghost text-left w-full">
                            Perfil
                        </Link>
                        <Link href="/panel" className="btn-ghost text-left w-full">
                            Painel cognitivo
                        </Link>
                    </div>
                )}
            </nav>

            {/* Navegação mobile */}
            <nav
                data-testid="mobile-navigation"
                aria-label="Principal"
                className={[
                    "md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-100 p-4 flex justify-around z-50",
                    navProfile === "simple" ? "bg-white" : "bg-white",
                ].join(" ")}
            >
                {items.map((item) => {
                    const active = isActivePath(pathname, item.path);
                    const label = useShortLabels ? item.shortLabel ?? item.label : item.label;
                    const Icon = item.Icon;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                            aria-current={active ? "page" : undefined}
                            className={["flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors", active ? "text-[#005A9C]" : "text-[#546E7A]"].join(
                                " "
                            )}
                        >
                            <Icon className="w-6 h-6" aria-hidden="true" />
                            <span className="text-xs font-medium">{label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
