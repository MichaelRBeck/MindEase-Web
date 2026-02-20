"use client";

import * as React from "react";
import { DEFAULT_USER_PROFILE, type UserProfile } from "@/features/profile/domain/userProfile";
import { useAuth } from "@/features/auth/presentation/AuthProvider";
import { makeUserProfileRepository, emitProfileUpdated } from "@/features/profile/data/userProfileRepositoryFactory";
import { Info, CheckCircle2, RotateCcw } from "lucide-react";

const FOCUS_DURATION_OPTIONS: readonly number[] = [2, 10, 15, 25, 30, 45] as const;

export function ProfilePage() {
    const { user } = useAuth();
    const uid = user?.uid;
    if (!uid) return null;

    // Repo do perfil (carrega/salva as preferências do usuário)
    const repo = React.useMemo(() => makeUserProfileRepository(uid), [uid]);

    const [draft, setDraft] = React.useState<UserProfile>(DEFAULT_USER_PROFILE);
    const [hydrated, setHydrated] = React.useState(false);
    const [statusMsg, setStatusMsg] = React.useState<string | null>(null);

    // Carrega o perfil salvo ao entrar na página
    React.useEffect(() => {
        (async () => {
            const stored = await repo.load();
            setDraft(stored ?? DEFAULT_USER_PROFILE);
            setHydrated(true);
        })();
    }, [repo]);

    // Atualiza o rascunho do perfil sem salvar ainda
    function update(patch: Partial<UserProfile>) {
        setDraft((prev) => ({ ...prev, ...patch, updatedAt: Date.now() }));
    }

    // Salva o perfil e avisa o app pra re-hidratar onde precisar
    async function handleSave() {
        const next: UserProfile = { ...draft, updatedAt: Date.now() };
        await repo.save(next);
        emitProfileUpdated();

        setStatusMsg("Perfil salvo.");
        window.setTimeout(() => setStatusMsg(null), 4000);
    }

    // Restaura as configurações padrão
    async function handleRestoreDefaults() {
        await repo.save(DEFAULT_USER_PROFILE);
        setDraft(DEFAULT_USER_PROFILE);

        emitProfileUpdated();

        setStatusMsg("Padrões restaurados.");
        window.setTimeout(() => setStatusMsg(null), 4000);
    }

    if (!hydrated) {
        return (
            <main className="min-h-screen bg-[#F4F4F9]">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <p className="text-sm text-[#546E7A]">Carregando perfil...</p>
                </div>
            </main>
        );
    }

    return (
        <main data-testid="profile-container" className="min-h-screen bg-[#F4F4F9]">
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                <header>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50] mb-2">Perfil</h1>
                    <p className="text-lg text-[#546E7A]">Preferências persistentes para reduzir sobrecarga</p>
                </header>

                {statusMsg && (
                    <div
                        role="status"
                        className="bg-[#E8F5E9] border border-[#2E7D32]/20 rounded-2xl p-4 text-sm text-[#2C3E50] flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>{statusMsg}</span>
                    </div>
                )}

                <section className="card space-y-4" aria-label="Identidade do usuário">
                    <div>
                        <h2 className="text-xl font-bold text-[#2C3E50] mb-2">Usuário</h2>
                        <p className="text-sm text-[#546E7A]">Esse nome pode aparecer no Dashboard</p>
                    </div>

                    <label className="block text-sm font-medium text-[#2C3E50]">
                        Nome de exibição
                        <input
                            className="input-field mt-2"
                            value={draft.displayName}
                            onChange={(e) => update({ displayName: e.target.value })}
                            placeholder="MindEaser"
                        />
                    </label>
                </section>

                <section className="card space-y-4" aria-label="Perfil de navegação">
                    <div>
                        <h2 className="text-xl font-bold text-[#2C3E50] mb-2">Perfil de navegação</h2>
                        <p className="text-sm text-[#546E7A]">Define como o menu aparece (salvo)</p>
                    </div>

                    <label className="block text-sm font-medium text-[#2C3E50]">
                        Perfil
                        <select
                            className="input-field mt-2"
                            value={draft.navigationProfile}
                            onChange={(e) =>
                                update({ navigationProfile: e.target.value as UserProfile["navigationProfile"] })
                            }
                        >
                            <option value="simple">Simples</option>
                            <option value="guided">Guiado</option>
                            <option value="power">Avançado</option>
                        </select>
                    </label>
                </section>

                <section className="card space-y-4" aria-label="Necessidades específicas">
                    <div>
                        <h2 className="text-xl font-bold text-[#2C3E50] mb-2">Necessidades específicas</h2>
                        <p className="text-sm text-[#546E7A]">
                            Essas opções influenciam o <strong>Painel Cognitivo</strong> e a interface
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={draft.needs.shortTexts}
                                onChange={(e) => update({ needs: { ...draft.needs, shortTexts: e.target.checked } })}
                            />
                            <span className="text-sm text-[#2C3E50]">
                                Preferir textos curtos (ativa modo resumo e reduz complexidade)
                            </span>
                        </label>

                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={draft.needs.reduceStimuli}
                                onChange={(e) => update({ needs: { ...draft.needs, reduceStimuli: e.target.checked } })}
                            />
                            <span className="text-sm text-[#2C3E50]">
                                Reduzir estímulos (desliga animações e aumenta conforto de leitura)
                            </span>
                        </label>

                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={draft.needs.highContrastPreferred}
                                onChange={(e) =>
                                    update({ needs: { ...draft.needs, highContrastPreferred: e.target.checked } })
                                }
                            />
                            <span className="text-sm text-[#2C3E50]">Preferir alto contraste</span>
                        </label>

                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={draft.needs.gentleReminders}
                                onChange={(e) =>
                                    update({ needs: { ...draft.needs, gentleReminders: e.target.checked } })
                                }
                            />
                            <span className="text-sm text-[#2C3E50]">Lembretes gentis (alertas cognitivos)</span>
                        </label>
                    </div>

                    <div className="bg-[#E1F5FE] border border-[#005A9C]/20 rounded-2xl p-4">
                        <p className="text-sm text-[#2C3E50] leading-relaxed flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5" aria-hidden="true" />
                            <span>
                                Depois de salvar, vá ao <strong>Painel Cognitivo</strong> e veja contraste, modo resumo, animações e
                                alertas se ajustando automaticamente.
                            </span>
                        </p>
                    </div>
                </section>

                <section className="card space-y-4" aria-label="Rotina">
                    <div>
                        <h2 className="text-xl font-bold text-[#2C3E50] mb-2">Rotina de estudo/trabalho</h2>
                        <p className="text-sm text-[#546E7A]">Define padrões do Timer (salvo)</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block text-sm font-medium text-[#2C3E50]">
                            Estudo ou trabalho
                            <select
                                className="input-field mt-2"
                                value={draft.routine.workOrStudy}
                                onChange={(e) =>
                                    update({ routine: { ...draft.routine, workOrStudy: e.target.value as "work" | "study" } })
                                }
                            >
                                <option value="study">Estudo</option>
                                <option value="work">Trabalho</option>
                            </select>
                        </label>

                        <label className="block text-sm font-medium text-[#2C3E50]">
                            Período preferido
                            <select
                                className="input-field mt-2"
                                value={draft.routine.preferredPeriod}
                                onChange={(e) =>
                                    update({
                                        routine: {
                                            ...draft.routine,
                                            preferredPeriod: e.target.value as UserProfile["routine"]["preferredPeriod"],
                                        },
                                    })
                                }
                            >
                                <option value="morning">Manhã</option>
                                <option value="afternoon">Tarde</option>
                                <option value="night">Noite</option>
                            </select>
                        </label>

                        <label className="block text-sm font-medium text-[#2C3E50]">
                            Duração preferida do foco (minutos)
                            <select
                                className="input-field mt-2"
                                value={draft.routine.preferredFocusMinutes}
                                onChange={(e) =>
                                    update({ routine: { ...draft.routine, preferredFocusMinutes: Number(e.target.value) } })
                                }
                            >
                                {FOCUS_DURATION_OPTIONS.map((m) => (
                                    <option key={m} value={m}>
                                        {m} min
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block text-sm font-medium text-[#2C3E50]">
                            Meta de sessões por dia
                            <input
                                className="input-field mt-2"
                                type="number"
                                min={1}
                                value={draft.routine.sessionsPerDayGoal}
                                onChange={(e) =>
                                    update({ routine: { ...draft.routine, sessionsPerDayGoal: Number(e.target.value) || 1 } })
                                }
                            />
                        </label>
                    </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button type="button" className="btn-secondary flex items-center gap-2" onClick={handleRestoreDefaults}>
                        <RotateCcw className="w-4 h-4" aria-hidden="true" />
                        Restaurar padrões
                    </button>
                    <button type="button" className="btn-primary" onClick={() => void handleSave()}>
                        Salvar perfil
                    </button>
                </div>
            </div>
        </main>
    );
}
