"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCognitive } from "@/features/cognitive/presentation/CognitiveProvider";
import { useUserProfile } from "@/features/profile/presentation/hooks/useUserProfile";

type NavItem = {
    path: string;
    label: string;
    icon: string;
    shortLabel?: string;
};

const NAV_ITEMS: readonly NavItem[] = [
    { path: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: "🏠" },
    { path: "/panel", label: "Cognitive Panel", shortLabel: "Panel", icon: "🧠" },
    { path: "/tasks", label: "Tasks", shortLabel: "Tasks", icon: "📋" },
    { path: "/timer", label: "Timer", shortLabel: "Timer", icon: "⏱️" },
    { path: "/profile", label: "Profile", shortLabel: "Profile", icon: "👤" },
    { path: "/settings", label: "Settings", shortLabel: "Settings", icon: "⚙️" },
] as const;

function isActivePath(pathname: string, itemPath: string) {
    return pathname === itemPath;
}

// ✅ Opção A
function getNavItemsForProfile(profile: "simple" | "guided" | "power"): readonly NavItem[] {
    if (profile === "simple") {
        return NAV_ITEMS.filter((i) => ["/dashboard", "/tasks", "/timer", "/settings"].includes(i.path));
    }
    return NAV_ITEMS;
}

function profileBadge(profile: "simple" | "guided" | "power") {
    if (profile === "simple") return { text: "Simple Navigation", cls: "bg-[#E8F5E9] text-[#2E7D32]" };
    if (profile === "guided") return { text: "Guided Navigation", cls: "bg-[#E1F5FE] text-[#005A9C]" };
    return { text: "Power Navigation", cls: "bg-[#FFF8E1] text-[#8A6D00]" };
}

export function Sidebar() {
    const pathname = usePathname();
    const { applied } = useCognitive();
    const { profile } = useUserProfile();

    const navProfile = profile.navigationProfile;
    const items = getNavItemsForProfile(navProfile); // ✅ sem hook
    const badge = profileBadge(navProfile);

    const useShortLabels = navProfile === "simple";

    // Focus mode esconde sidebar
    if (applied.focusMode) return null;

    return (
        <>
            {/* Desktop Sidebar */}
            <nav
                data-testid="desktop-navigation"
                aria-label="Primary"
                className={[
                    "hidden md:flex fixed left-0 top-0 h-screen w-64 backdrop-blur-xl border-r border-slate-100 p-6 flex-col gap-2 z-40",
                    navProfile === "simple" ? "bg-white" : "bg-white/80",
                ].join(" ")}
            >
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#005A9C]">MindEase</h2>
                    <p className="text-sm text-[#546E7A] mt-1">Your calm space</p>

                    {/* ✅ Badge bem visível para o vídeo */}
                    <div className="mt-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${badge.cls}`}>
                            {badge.text}
                        </span>
                    </div>

                    {/* ✅ Copy curta que explica a diferença (cognitiva) */}
                    <p className="text-xs text-[#546E7A] mt-2 leading-relaxed">
                        {navProfile === "simple" && "Fewer options on screen to reduce overload."}
                        {navProfile === "guided" && "Full navigation with gentle guidance."}
                        {navProfile === "power" && "Full navigation + quick shortcuts."}
                    </p>
                </div>

                {/* ✅ Quick actions (Power) */}
                {navProfile === "power" && (
                    <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-3">
                        <p className="text-xs font-bold text-[#2C3E50] mb-2">Quick actions</p>
                        <div className="flex flex-col gap-2">
                            <Link className="btn-secondary text-left" href="/tasks">
                                + Add task
                            </Link>
                            <Link className="btn-secondary text-left" href="/timer">
                                Start timer
                            </Link>
                            <Link className="btn-ghost text-left" href="/panel">
                                Adjust cognitive panel
                            </Link>
                        </div>
                    </div>
                )}

                {/* ✅ Guided hint */}
                {navProfile === "guided" && (
                    <div className="mb-4 rounded-2xl border border-[#005A9C]/15 bg-[#E1F5FE] p-3">
                        <p className="text-xs font-bold text-[#2C3E50]">Tip</p>
                        <p className="text-xs text-[#546E7A] leading-relaxed mt-1">
                            If it feels too much, switch to <strong>Simple</strong> and enable <strong>Focus Mode</strong>.
                        </p>
                    </div>
                )}

                {items.map((item) => {
                    const active = isActivePath(pathname, item.path);
                    const label = useShortLabels ? item.shortLabel ?? item.label : item.label;

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
                            <span className="text-xl" aria-hidden="true">
                                {item.icon}
                            </span>
                            <span>{label}</span>
                        </Link>
                    );
                })}

                {/* ✅ Em Simple, deixa um “atalho seguro” pro Profile/Painel sem poluir menu */}
                {navProfile === "simple" && (
                    <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                        <Link href="/profile" className="btn-ghost text-left w-full">
                            👤 Profile
                        </Link>
                        <Link href="/panel" className="btn-ghost text-left w-full">
                            🧠 Cognitive Panel
                        </Link>
                    </div>
                )}
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav
                data-testid="mobile-navigation"
                aria-label="Primary"
                className={[
                    "md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-100 p-4 flex justify-around z-50",
                    navProfile === "simple" ? "bg-white" : "bg-white",
                ].join(" ")}
            >
                {items.map((item) => {
                    const active = isActivePath(pathname, item.path);
                    const label = useShortLabels ? item.shortLabel ?? item.label : item.label;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                            aria-current={active ? "page" : undefined}
                            className={[
                                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
                                active ? "text-[#005A9C]" : "text-[#546E7A]",
                            ].join(" ")}
                        >
                            <span className="text-2xl" aria-hidden="true">
                                {item.icon}
                            </span>
                            <span className="text-xs font-medium">{label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
