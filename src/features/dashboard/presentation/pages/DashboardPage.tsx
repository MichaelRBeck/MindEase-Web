"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCognitive } from "@/features/cognitive/presentation/CognitiveProvider";
import { useTasksBoard, getCountsFromByStatus } from "@/features/tasks/presentation/TasksProvider";
import { useUserProfile } from "@/features/profile/presentation/hooks/useUserProfile";
import type { Task, TaskStatus } from "@/features/tasks/domain/task";

type User = { name: string };

type AdviceItem = {
    id: string;
    title: string;
    hint: string;
    tone: "info" | "success" | "warning";
};

function statusLabel(status: TaskStatus): string {
    if (status === "todo") return "To Do";
    if (status === "doing") return "Doing";
    return "Done";
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function formatRelativeTime(ts: number): string {
    const diffMs = Date.now() - ts;
    if (!Number.isFinite(diffMs)) return "recentemente";
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin <= 0) return "agora";
    if (diffMin < 60) return `há ${diffMin} min`;

    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `há ${diffH}h`;

    const diffD = Math.floor(diffH / 24);
    return `há ${diffD} dia${diffD > 1 ? "s" : ""}`;
}

function getAllTasks(byStatus: Record<TaskStatus, Task[]>) {
    const all = [...(byStatus.todo ?? []), ...(byStatus.doing ?? []), ...(byStatus.done ?? [])];
    return all;
}

function getTaskMetrics(allTasks: Task[]) {
    const highPriority = allTasks.filter((t) => t.priority === "high").length;

    let checklistTotal = 0;
    let checklistDone = 0;

    for (const t of allTasks) {
        const items = t.checklist ?? [];
        checklistTotal += items.length;
        checklistDone += items.filter((i) => i.done).length;
    }

    const checklistPending = Math.max(0, checklistTotal - checklistDone);

    return { highPriority, checklistTotal, checklistDone, checklistPending };
}

function toneClass(t: AdviceItem["tone"]) {
    return t === "success"
        ? "bg-[#E8F5E9] border-[#2E7D32]/20"
        : t === "warning"
            ? "bg-[#FFF8E1] border-[#FFBF00]/30"
            : "bg-[#E1F5FE] border-[#005A9C]/20";
}

export function DashboardPage() {
    const router = useRouter();
    const { applied } = useCognitive();
    const { profile } = useUserProfile();

    const name = profile.displayName?.trim() ? profile.displayName : "MindEaser";

    const complexityLevel = applied.complexityLevel;
    const focusMode = applied.focusMode;

    const [user, setUser] = React.useState<User | null>(null);
    const [showAlert, setShowAlert] = React.useState(false);

    const { byStatus, loading } = useTasksBoard();
    const taskStats = getCountsFromByStatus(byStatus);

    const allTasks = React.useMemo(() => getAllTasks(byStatus), [byStatus]);
    const metrics = React.useMemo(() => getTaskMetrics(allTasks), [allTasks]);

    const completionPct = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;

    // “tarefas recentes” reais: últimas atualizadas
    const recentTasks = React.useMemo(() => {
        const sorted = [...allTasks].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        return sorted.slice(0, 6);
    }, [allTasks]);

    // “conselhos” simples (sem monitorar nada): só regras pelo estado atual
    const advice = React.useMemo<AdviceItem[]>(() => {
        const items: AdviceItem[] = [];

        if (loading) {
            items.push({
                id: "ad-loading",
                title: "Carregando tarefas",
                hint: "Assim que carregar, vamos sugerir o próximo passo com base no seu Kanban.",
                tone: "info",
            });
            return items;
        }

        if (taskStats.total === 0) {
            items.push({
                id: "ad-empty",
                title: "Comece pequeno",
                hint: "Crie 1 tarefa simples e mova para Doing quando for começar.",
                tone: "success",
            });
            items.push({
                id: "ad-timer",
                title: "Uma coisa por vez",
                hint: "Use o Timer para manter o foco e reduzir alternância.",
                tone: "info",
            });
            return items;
        }

        if (taskStats.doing === 0) {
            items.push({
                id: "ad-no-doing",
                title: "Escolha 1 tarefa para agora",
                hint: "Mova uma tarefa de To Do para Doing para ter um foco claro.",
                tone: "warning",
            });
        } else if (taskStats.doing >= 2) {
            items.push({
                id: "ad-many-doing",
                title: "Poucas coisas em paralelo",
                hint: "Se possível, mantenha 1 tarefa em Doing para reduzir sobrecarga.",
                tone: "warning",
            });
        } else {
            items.push({
                id: "ad-ok-doing",
                title: "Bom foco",
                hint: "Você tem 1 tarefa em Doing — ótimo para previsibilidade.",
                tone: "success",
            });
        }

        if (taskStats.todo >= 6) {
            items.push({
                id: "ad-big-todo",
                title: "Lista grande? Simplifique",
                hint: "Escolha 1 prioridade do To Do e ignore o resto por agora.",
                tone: "warning",
            });
        } else {
            items.push({
                id: "ad-small-todo",
                title: "To Do sob controle",
                hint: "Seu backlog parece enxuto. Continue com passos pequenos.",
                tone: "success",
            });
        }

        if (metrics.checklistPending > 0) {
            items.push({
                id: "ad-checklist",
                title: "Use o checklist a seu favor",
                hint: `Você tem ${metrics.checklistPending} item(ns) de checklist pendente(s). Concluir 1 já reduz carga mental.`,
                tone: "info",
            });
        } else {
            items.push({
                id: "ad-checklist-none",
                title: "Checklist opcional",
                hint: "Se uma tarefa parecer grande, quebre em 3 passos pequenos.",
                tone: "info",
            });
        }

        if (metrics.highPriority > 0) {
            items.push({
                id: "ad-high",
                title: "Prioridades altas",
                hint: `Você tem ${metrics.highPriority} tarefa(s) com prioridade alta. Selecione só 1 para agora.`,
                tone: "warning",
            });
        }

        items.push({
            id: "ad-panel",
            title: "Ajuste quando precisar",
            hint: "Se estiver cansativo, reduza a Complexidade no Painel Cognitivo.",
            tone: "info",
        });

        return items.slice(0, 5);
    }, [loading, taskStats.total, taskStats.todo, taskStats.doing, metrics.checklistPending, metrics.highPriority]);

    React.useEffect(() => {
        const loadUser = async () => {
            await new Promise((r) => setTimeout(r, 250));
            setUser({ name: "Minds" });
        };

        void loadUser();

        const timer = window.setTimeout(() => setShowAlert(true), 10000);
        return () => window.clearTimeout(timer);
    }, []);

    if (!user) {
        return (
            <div className="min-h-screen bg-[#F4F4F9] flex items-center justify-center">
                <p className="text-[#546E7A]">Loading...</p>
            </div>
        );
    }

    const renderSimpleMode = () => (
        <div data-testid="dashboard-simple" className="space-y-8">
            <div className="card text-center space-y-6">
                <h2 className="text-3xl font-bold text-[#2C3E50]">Qual é o seu foco hoje?</h2>
                <p className="text-lg text-[#546E7A]">Comece com uma coisa por vez</p>
                <button data-testid="dashboard-start-focus-btn" onClick={() => router.push("/timer")} className="btn-primary" type="button">
                    Iniciar sessão de foco
                </button>
            </div>

            <div className="bg-white/60 border border-slate-100 rounded-2xl p-4">
                <p className="text-sm text-[#546E7A] leading-relaxed">
                    💡 Dica: se estiver muito “cheio”, mantenha a complexidade em <strong>Simple</strong>.
                </p>
            </div>
        </div>
    );

    // Medium = tudo organizado
    const renderMediumMode = () => (
        <div data-testid="dashboard-medium" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                    <p className="text-sm font-medium text-[#546E7A] mb-2">Total de tarefas</p>
                    <p className="text-4xl font-bold text-[#2C3E50]">{loading ? "…" : taskStats.total}</p>
                </div>
                <div className="card">
                    <p className="text-sm font-medium text-[#546E7A] mb-2">To Do</p>
                    <p className="text-4xl font-bold text-[#005A9C]">{loading ? "…" : taskStats.todo}</p>
                </div>
                <div className="card">
                    <p className="text-sm font-medium text-[#546E7A] mb-2">Em progresso</p>
                    <p className="text-4xl font-bold text-[#FFBF00]">{loading ? "…" : taskStats.doing}</p>
                </div>
                <div className="card">
                    <p className="text-sm font-medium text-[#546E7A] mb-2">Concluídas</p>
                    <p className="text-4xl font-bold text-[#2E7D32]">{loading ? "…" : taskStats.done}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card space-y-4">
                    <h3 className="text-2xl font-bold text-[#2C3E50]">Ações rápidas</h3>

                    <div className="space-y-3">
                        <button onClick={() => router.push("/tasks")} className="card-interactive w-full text-left" type="button" data-testid="dashboard-view-tasks-btn">
                            <span className="text-2xl mb-2 block" aria-hidden="true">
                                📋
                            </span>
                            <p className="font-bold text-[#2C3E50]">Gerenciar tarefas</p>
                            <p className="text-sm text-[#546E7A]">Organize seu Kanban</p>
                        </button>

                        <button onClick={() => router.push("/timer")} className="card-interactive w-full text-left" type="button" data-testid="dashboard-start-timer-btn">
                            <span className="text-2xl mb-2 block" aria-hidden="true">
                                ⏱️
                            </span>
                            <p className="font-bold text-[#2C3E50]">Focus Timer</p>
                            <p className="text-sm text-[#546E7A]">Inicie uma sessão gentil</p>
                        </button>
                    </div>
                </div>

                <div className="card space-y-4">
                    <h3 className="text-2xl font-bold text-[#2C3E50]">Visão de progresso</h3>

                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-[#546E7A]">Conclusão</span>
                                <span className="font-medium text-[#2C3E50]">{loading ? "…" : `${completionPct}%`}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
                                <div className="bg-[#2E7D32] h-3 rounded-full transition-all duration-500" style={{ width: `${clamp(completionPct, 0, 100)}%` }} />
                            </div>
                        </div>

                        <div className="bg-white/60 border border-slate-100 rounded-2xl p-4">
                            <p className="text-sm text-[#546E7A] leading-relaxed">💡 Se você estiver pulando entre coisas, use o Timer para “uma coisa por vez”.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Detailed = Medium + densidade real baseada nas tarefas
    const renderDetailedMode = () => {
        const focusSuggestion = (byStatus.doing ?? [])[0] ?? (byStatus.todo ?? [])[0] ?? null;

        return (
            <div data-testid="dashboard-detailed" className="space-y-8">
                {renderMediumMode()}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 1) Tarefas recentes (reais) */}
                    <div className="card space-y-4">
                        <h3 className="text-xl font-bold text-[#2C3E50]">Tarefas recentes</h3>

                        {loading ? (
                            <p className="text-sm text-[#546E7A]">Carregando…</p>
                        ) : recentTasks.length === 0 ? (
                            <p className="text-sm text-[#546E7A]">Sem tarefas ainda.</p>
                        ) : (
                            <ul className="space-y-3">
                                {recentTasks.map((t) => (
                                    <li key={t.id} className="rounded-2xl border border-slate-100 bg-white p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-[#2C3E50] truncate">{t.title}</p>
                                                <p className="text-xs text-[#546E7A]">
                                                    {statusLabel(t.status)} • atualizada {formatRelativeTime(t.updatedAt)}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                className="btn-ghost px-3 py-2"
                                                onClick={() => router.push("/tasks")}
                                                aria-label="Ver no Kanban"
                                            >
                                                ↗
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {focusSuggestion && (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                <p className="text-xs text-[#546E7A]">Sugestão de foco</p>
                                <p className="text-sm font-semibold text-[#2C3E50] truncate">{focusSuggestion.title}</p>
                                <p className="text-xs text-[#546E7A] mt-1">Abra o Kanban e defina o próximo passo.</p>
                            </div>
                        )}
                    </div>

                    {/* 2) Conselhos baseados no Kanban (simples, sem tracking) */}
                    <div className="card space-y-4">
                        <h3 className="text-xl font-bold text-[#2C3E50]">Conselhos do momento</h3>

                        <div className="space-y-3">
                            {advice.map((a) => (
                                <div key={a.id} className={`rounded-2xl border p-3 ${toneClass(a.tone)}`}>
                                    <p className="text-sm font-bold text-[#2C3E50]">{a.title}</p>
                                    <p className="text-xs text-[#546E7A] leading-relaxed mt-1">{a.hint}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            <button type="button" className="btn-secondary" onClick={() => router.push("/tasks")}>
                                Abrir Kanban
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => router.push("/panel")}>
                                Ajustar painel
                            </button>
                        </div>
                    </div>

                    {/* 3) Mais dados (reais e “densos”) */}
                    <div className="card space-y-4">
                        <h3 className="text-xl font-bold text-[#2C3E50]">Mais dados</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                <p className="text-xs text-[#546E7A]">Prioridade alta</p>
                                <p className="text-2xl font-bold text-[#2C3E50]">{loading ? "…" : metrics.highPriority}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                <p className="text-xs text-[#546E7A]">Checklist pendente</p>
                                <p className="text-2xl font-bold text-[#2C3E50]">{loading ? "…" : metrics.checklistPending}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                <p className="text-xs text-[#546E7A]">Em progresso</p>
                                <p className="text-2xl font-bold text-[#2C3E50]">{loading ? "…" : taskStats.doing}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                <p className="text-xs text-[#546E7A]">Conclusão</p>
                                <p className="text-2xl font-bold text-[#2C3E50]">{loading ? "…" : `${completionPct}%`}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
                            <p className="text-sm font-bold text-[#2C3E50]">Checklist (resumo)</p>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#546E7A]">Concluídos</span>
                                <span className="font-semibold text-[#2C3E50]">{loading ? "…" : metrics.checklistDone}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#546E7A]">Total</span>
                                <span className="font-semibold text-[#2C3E50]">{loading ? "…" : metrics.checklistTotal}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/60 border border-slate-100 rounded-2xl p-4">
                    <p className="text-sm text-[#546E7A] leading-relaxed">
                        💡 Este modo “Detailed” existe para demonstrar densidade de informação. Se ficar cansativo, volte para{" "}
                        <strong>Medium</strong> ou <strong>Simple</strong>.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <main data-testid="dashboard-container" className="min-h-screen bg-[#F4F4F9]">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {!focusMode && (
                    <header>
                        <h1 className="text-4xl font-bold text-[#2C3E50]">Olá, {name}</h1>
                        <p className="text-lg text-[#546E7A]">Vamos com calma, uma coisa por vez.</p>
                    </header>
                )}

                {showAlert && !focusMode && (
                    <section data-testid="gentle-alert" className="bg-[#FFF8E1] border border-[#FFBF00]/30 rounded-3xl p-6">
                        <p className="text-[#2C3E50] leading-relaxed">
                            💡 Você pode ajustar a <strong>Complexidade da Interface</strong> no{" "}
                            <Link href="/panel" className="text-[#005A9C] underline font-medium">
                                Painel Cognitivo
                            </Link>{" "}
                            a qualquer momento.
                        </p>
                        <button
                            data-testid="dismiss-alert-btn"
                            onClick={() => setShowAlert(false)}
                            className="mt-3 text-sm text-[#546E7A] hover:text-[#2C3E50]"
                            type="button"
                        >
                            Fechar
                        </button>
                    </section>
                )}

                {complexityLevel === "simple" && renderSimpleMode()}
                {complexityLevel === "medium" && renderMediumMode()}
                {complexityLevel === "detailed" && renderDetailedMode()}
            </div>
        </main>
    );
}
