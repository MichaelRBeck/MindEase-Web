"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCognitive } from "@/features/cognitive/presentation/CognitiveProvider";
import { Brain, RotateCcw, LogOut, User, Lightbulb, HelpCircle } from "lucide-react";

export function SettingsPage() {
    const router = useRouter();
    const cognitive = useCognitive();

    const [statusMsg, setStatusMsg] = React.useState<string | null>(null);

    // Logout “mock”: só volta pra landing
    function handleLogout() {
        router.push("/");
    }

    function handleOpenProfile() {
        router.push("/profile");
    }

    // Restaura as preferências do Painel Cognitivo
    async function handleResetDefaults() {
        await cognitive.resetPreferences();
        setStatusMsg("Preferências restauradas para o padrão.");
        window.setTimeout(() => setStatusMsg(null), 4000);
    }

    return (
        <main data-testid="settings-container" className="min-h-screen bg-[#F4F4F9]">
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                <header>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50] mb-2">Configurações</h1>
                    <p className="text-lg text-[#546E7A]">Atalhos e opções essenciais</p>
                </header>

                {statusMsg && (
                    <div
                        role="status"
                        className="bg-[#E8F5E9] border border-[#2E7D32]/20 rounded-2xl p-4 text-sm text-[#2C3E50]"
                    >
                        {statusMsg}
                    </div>
                )}

                <div className="space-y-6">
                    <section className="card space-y-4" aria-label="Conta">
                        <div>
                            <h2 className="text-xl font-bold text-[#2C3E50] mb-2">Conta</h2>
                            <p className="text-sm text-[#546E7A]">Perfil e ações de sessão</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button type="button" onClick={handleOpenProfile} className="btn-secondary flex items-center gap-2">
                                <User className="w-4 h-4" aria-hidden="true" />
                                Perfil (mock)
                            </button>

                            <button
                                data-testid="settings-logout-btn"
                                type="button"
                                onClick={handleLogout}
                                className="btn-primary flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" aria-hidden="true" />
                                Sair
                            </button>
                        </div>

                        <div className="bg-white/60 border border-slate-100 rounded-2xl p-4">
                            <p className="text-sm text-[#546E7A] leading-relaxed">
                                <span className="inline-flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" aria-hidden="true" />
                                    Depois dá pra conectar login/logout e dados do perfil no Firebase.
                                </span>
                            </p>
                        </div>
                    </section>

                    <section className="card space-y-4" aria-label="Preferências">
                        <div>
                            <h2 className="text-xl font-bold text-[#2C3E50] mb-2">Preferências</h2>
                            <p className="text-sm text-[#546E7A]">Ajustes cognitivos e acesso rápido</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link data-testid="settings-open-panel-link" href="/panel" className="card-interactive text-left">
                                <Brain className="w-6 h-6 mb-2" aria-hidden="true" />
                                <p className="font-bold text-[#2C3E50]">Abrir Painel Cognitivo</p>
                                <p className="text-sm text-[#546E7A]">
                                    Complexidade, modo foco, contraste, espaçamento e alertas
                                </p>
                            </Link>

                            <button
                                data-testid="settings-reset-defaults-btn"
                                type="button"
                                onClick={handleResetDefaults}
                                className="card-interactive text-left"
                            >
                                <RotateCcw className="w-6 h-6 mb-2" aria-hidden="true" />
                                <p className="font-bold text-[#2C3E50]">Restaurar padrão</p>
                                <p className="text-sm text-[#546E7A]">Volta para uma configuração mais “calma”</p>
                            </button>
                        </div>

                        <div className="bg-[#FFF8E1] border border-[#FFBF00]/30 rounded-2xl p-4">
                            <p className="text-sm text-[#2C3E50] leading-relaxed">
                                <span className="inline-flex items-start gap-2">
                                    <Lightbulb className="w-4 h-4 mt-0.5" aria-hidden="true" />
                                    <span>
                                        Dica: se estiver pesado, use a complexidade <strong>Simples</strong> e ative o{" "}
                                        <strong>Modo foco</strong>.
                                    </span>
                                </span>
                            </p>
                        </div>
                    </section>

                    <section className="card space-y-4" aria-label="Ajuda e dicas">
                        <div>
                            <h2 className="text-xl font-bold text-[#2C3E50] mb-2">Ajuda e dicas</h2>
                            <p className="text-sm text-[#546E7A]">Hábitos pequenos que reduzem carga mental</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
                                <p className="font-bold text-[#2C3E50]">Uma coisa por vez</p>
                                <p className="text-sm text-[#546E7A]">Use o timer e mantenha só 1 tarefa ativa.</p>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
                                <p className="font-bold text-[#2C3E50]">Reduzir estímulos</p>
                                <p className="text-sm text-[#546E7A]">Diminua animações e aumente espaçamento se precisar.</p>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
                                <p className="font-bold text-[#2C3E50]">Deixar previsível</p>
                                <p className="text-sm text-[#546E7A]">Mantenha uma rotina e revise suas tarefas todo dia.</p>
                            </div>
                        </div>

                        <div className="bg-white/60 border border-slate-100 rounded-2xl p-4">
                            <p className="text-sm text-[#546E7A] leading-relaxed inline-flex items-start gap-2">
                                <HelpCircle className="w-4 h-4 mt-0.5" aria-hidden="true" />
                                <span>
                                    O MindEase foca em acessibilidade cognitiva: textos curtos, layout previsível e feedback gentil.
                                </span>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
