"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCognitive } from "@/features/cognitive/presentation/CognitiveProvider";

export function SettingsPage() {
    const router = useRouter();
    const cognitive = useCognitive();

    const [statusMsg, setStatusMsg] = React.useState<string | null>(null);

    function handleLogout() {
        // Front-only: só volta pra landing
        router.push("/");
    }

    function handleOpenProfile() {
        router.push("/profile");
    }

    async function handleResetDefaults() {
        await cognitive.resetPreferences();
        setStatusMsg("Preferences restored to default 🌸");
    }

    return (
        <main data-testid="settings-container" className="min-h-screen bg-[#F4F4F9]">
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                <header>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50] mb-2">Settings</h1>
                    <p className="text-lg text-[#546E7A]">Shortcuts and essentials</p>
                </header>

                {/* Status */}
                {statusMsg && (
                    <div
                        role="status"
                        className="bg-[#E8F5E9] border border-[#2E7D32]/20 rounded-2xl p-4 text-sm text-[#2C3E50]"
                    >
                        {statusMsg}
                    </div>
                )}

                <div className="space-y-6">
                    {/* 1) Conta */}
                    <section className="card space-y-4" aria-label="Account">
                        <div>
                            <h2 className="text-xl font-bold text-[#2C3E50] mb-2">Account</h2>
                            <p className="text-sm text-[#546E7A]">Profile and session actions</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button type="button" onClick={handleOpenProfile} className="btn-secondary">
                                Profile (mock)
                            </button>

                            <button data-testid="settings-logout-btn" type="button" onClick={handleLogout} className="btn-primary">
                                Sign Out
                            </button>
                        </div>

                        <div className="bg-white/60 border border-slate-100 rounded-2xl p-4">
                            <p className="text-sm text-[#546E7A] leading-relaxed">
                                💡 Later we will connect login/logout and profile data with Firebase.
                            </p>
                        </div>
                    </section>

                    {/* 2) Preferências */}
                    <section className="card space-y-4" aria-label="Preferences">
                        <div>
                            <h2 className="text-xl font-bold text-[#2C3E50] mb-2">Preferences</h2>
                            <p className="text-sm text-[#546E7A]">Cognitive adjustments and quick access</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link
                                data-testid="settings-open-panel-link"
                                href="/panel"
                                className="card-interactive text-left"
                            >
                                <span className="text-2xl mb-2 block" aria-hidden="true">
                                    🧠
                                </span>
                                <p className="font-bold text-[#2C3E50]">Open Cognitive Panel</p>
                                <p className="text-sm text-[#546E7A]">Complexity, focus mode, contrast, spacing and alerts</p>
                            </Link>

                            <button
                                data-testid="settings-reset-defaults-btn"
                                type="button"
                                onClick={handleResetDefaults}
                                className="card-interactive text-left"
                            >
                                <span className="text-2xl mb-2 block" aria-hidden="true">
                                    ♻️
                                </span>
                                <p className="font-bold text-[#2C3E50]">Restore defaults</p>
                                <p className="text-sm text-[#546E7A]">Return to a calm baseline setup</p>
                            </button>
                        </div>

                        <div className="bg-[#FFF8E1] border border-[#FFBF00]/30 rounded-2xl p-4">
                            <p className="text-sm text-[#2C3E50] leading-relaxed">
                                💡 Tip: If you feel overwhelmed, switch to <strong>Simple</strong> complexity and enable{" "}
                                <strong>Focus Mode</strong>.
                            </p>
                        </div>
                    </section>

                    {/* 3) Sobre / Ajuda */}
                    <section className="card space-y-4" aria-label="Help and tips">
                        <div>
                            <h2 className="text-xl font-bold text-[#2C3E50] mb-2">Help & Tips</h2>
                            <p className="text-sm text-[#546E7A]">Small habits that reduce cognitive load</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
                                <p className="text-lg" aria-hidden="true">🎯</p>
                                <p className="font-bold text-[#2C3E50]">One thing at a time</p>
                                <p className="text-sm text-[#546E7A]">Use the timer and keep one active task.</p>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
                                <p className="text-lg" aria-hidden="true">🧘</p>
                                <p className="font-bold text-[#2C3E50]">Reduce stimuli</p>
                                <p className="text-sm text-[#546E7A]">Disable animations and increase spacing if needed.</p>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
                                <p className="text-lg" aria-hidden="true">📌</p>
                                <p className="font-bold text-[#2C3E50]">Make it predictable</p>
                                <p className="text-sm text-[#546E7A]">Keep the same routine and review tasks daily.</p>
                            </div>
                        </div>

                        <div className="bg-white/60 border border-slate-100 rounded-2xl p-4">
                            <p className="text-sm text-[#546E7A] leading-relaxed">
                                MindEase is designed for cognitive accessibility: short texts, predictable layout, and gentle feedback.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
