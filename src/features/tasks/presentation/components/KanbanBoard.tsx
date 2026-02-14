"use client";

import * as React from "react";
import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/domain/task";
import { useTasksBoard } from "@/features/tasks/presentation/TasksProvider";
import { useCognitive } from "@/features/cognitive/presentation/CognitiveProvider";
import { useTransition } from "@/features/transitions/presentation/TransitionProvider";

import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    closestCenter,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
    createChecklistItem,
    getChecklistProgress,
    getNextChecklistItem,
    suggestChecklistForStatus,
    type ChecklistItem,
} from "@/features/tasks/domain/checklist";

type Column = { id: TaskStatus; title: string; bg: string };

const COLUMNS: readonly Column[] = [
    { id: "todo", title: "To Do", bg: "bg-[#E1F5FE]" },
    { id: "doing", title: "Doing", bg: "bg-[#FFF8E1]" },
    { id: "done", title: "Done", bg: "bg-[#E8F5E9]" },
] as const;

type TaskModalState =
    | { open: false }
    | { open: true; mode: "create"; presetStatus: TaskStatus }
    | { open: true; mode: "edit"; task: Task };

type CreateTaskInput = {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    checklist?: { id: string; text: string; done: boolean }[];
};

type UpdateTaskPatch = Partial<Pick<Task, "title" | "description" | "priority" | "status" | "checklist">>;

export function KanbanBoard() {
    const { byStatus, loading, add, edit, remove, move } = useTasksBoard();
    const transition = useTransition();

    const { applied } = useCognitive();
    const detailMode = applied.detailMode;
    const focusMode = applied.focusMode;
    const animationsOn = applied.animationsEnabled;

    const [modal, setModal] = React.useState<TaskModalState>({ open: false });

    // ✅ um pouco mais fácil de iniciar drag: distância menor + tolerante
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    const handleCreate = async (input: CreateTaskInput) => {
        await add(input);
        transition.show({
            tone: "success",
            message: "Tarefa criada. Quer adicionar um checklist para reduzir sobrecarga?",
            durationMs: 8000,
        });
    };

    const handleUpdate = async (id: string, patch: UpdateTaskPatch) => {
        await edit(id, patch);
        transition.show({
            tone: "info",
            message: "Tarefa atualizada. Revise o próximo passo quando fizer sentido.",
            durationMs: 7000,
        });
    };

    function openCreate(status: TaskStatus) {
        setModal({ open: true, mode: "create", presetStatus: status });
    }

    function openEdit(task: Task) {
        setModal({ open: true, mode: "edit", task });
    }

    async function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        const activeTask = findTask(byStatus, activeId);
        if (!activeTask) return;

        const target = parseOver(overId, byStatus);
        if (!target) return;

        // cross-column
        if (target.status !== activeTask.status) {
            const from = COLUMNS.find((c) => c.id === activeTask.status)?.title ?? activeTask.status;
            const to = COLUMNS.find((c) => c.id === target.status)?.title ?? target.status;

            await move(activeTask.id, target.status, target.index);

            transition.show({
                tone: "success",
                sticky: true,
                message: `Você moveu “${activeTask.title}” de ${from} para ${to}. Quer definir o próximo passo?`,
                actionLabel: "Definir próximo passo",
                onAction: () => {
                    transition.dismiss();
                    openEdit(activeTask);
                },
            });

            return;
        }

        // reorder mesma coluna
        const col = byStatus[activeTask.status];
        const oldIndex = col.findIndex((t) => t.id === activeTask.id);
        if (oldIndex < 0) return;

        const newIndex = target.index;
        if (oldIndex !== newIndex) {
            await move(activeTask.id, activeTask.status, newIndex);
            transition.show({
                tone: "info",
                message: `Ordem ajustada em “${COLUMNS.find((c) => c.id === activeTask.status)?.title ?? activeTask.status}”.`,
                durationMs: 2500,
            });
        }
    }

    return (
        <div className="space-y-6">
            <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
                {/* ✅ colunas mais afastadas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {COLUMNS.map((column) => {
                        const tasks = (byStatus[column.id] ?? []).map((t) => ({ ...t, checklist: t.checklist ?? [] }));
                        return (
                            <div key={column.id} data-testid={`column-${column.id}`} className="space-y-4">
                                <div className={`${column.bg} rounded-2xl p-4 flex items-center justify-between gap-3`}>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#2C3E50]">{column.title}</h3>
                                        <p className="text-sm text-[#546E7A]">{tasks.length} tasks</p>
                                    </div>

                                    <button type="button" onClick={() => openCreate(column.id)} className="btn-secondary px-5">
                                        + Add
                                    </button>
                                </div>

                                <ColumnDroppable status={column.id} items={tasks.map((t) => t.id)}>
                                    <div className="space-y-3 min-h-[140px]">
                                        {loading ? (
                                            <p className="text-sm text-[#546E7A]">Loading...</p>
                                        ) : (
                                            tasks.map((task) => (
                                                <SortableTaskCard
                                                    key={task.id}
                                                    task={task}
                                                    showDetails={detailMode === "detailed"}
                                                    showNextStepHint={focusMode || detailMode === "detailed"}
                                                    animationsOn={animationsOn}
                                                    onEdit={() => openEdit(task)}
                                                    onDelete={() => void remove(task.id)}
                                                />
                                            ))
                                        )}
                                    </div>
                                </ColumnDroppable>
                            </div>
                        );
                    })}
                </div>
            </DndContext>

            {modal.open && (
                <TaskModal
                    mode={modal.mode}
                    presetStatus={modal.mode === "create" ? modal.presetStatus : undefined}
                    task={modal.mode === "edit" ? modal.task : undefined}
                    onClose={() => setModal({ open: false })}
                    onCreate={handleCreate}
                    onUpdate={handleUpdate}
                />
            )}

            <div className="bg-[#E1F5FE] border border-[#005A9C]/20 rounded-3xl p-6 text-center">
                <p className="text-[#2C3E50] leading-relaxed">💡 Demo local: tarefas ainda não são salvas no Firebase.</p>
            </div>
        </div>
    );
}

function ColumnDroppable(props: { status: TaskStatus; items: string[]; children: React.ReactNode }) {
    const droppableId = `col:${props.status}`;
    const { setNodeRef, isOver } = useDroppable({ id: droppableId });

    return (
        <SortableContext items={props.items.map((id) => `task:${id}`)} strategy={verticalListSortingStrategy}>
            <div
                ref={setNodeRef}
                id={droppableId}
                className={[
                    "rounded-3xl p-3",
                    isOver ? "bg-white/70 border-2 border-dashed border-[#005A9C]/40" : "bg-transparent border-2 border-transparent",
                ].join(" ")}
            >
                {props.children}
            </div>
        </SortableContext>
    );
}

function SortableTaskCard(props: {
    task: Task;
    showDetails: boolean;
    showNextStepHint: boolean;
    animationsOn: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const id = `task:${props.task.id}`;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: props.animationsOn ? transition : undefined,
        opacity: isDragging ? 0.7 : 1,
    };

    const next = getNextChecklistItem(props.task.checklist as ChecklistItem[] | undefined);
    const progress = getChecklistProgress(props.task.checklist as ChecklistItem[] | undefined);

    return (
        <div ref={setNodeRef} style={style} data-testid={`task-card-${props.task.id}`}>
            <div className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2`}>
                <div className="flex items-start justify-between gap-3">
                    <button type="button" className="text-left flex-1" onClick={props.onEdit} aria-label="Editar tarefa">
                        <h4 className="font-bold text-[#2C3E50]">{props.task.title}</h4>
                    </button>

                    <div className="flex gap-2">
                        <button type="button" className="btn-ghost px-3 py-2" onClick={props.onEdit} aria-label="Editar">
                            ✏️
                        </button>
                        <button type="button" className="btn-ghost px-3 py-2" onClick={props.onDelete} aria-label="Excluir">
                            🗑️
                        </button>

                        {/* handle do drag */}
                        <button
                            type="button"
                            className="btn-ghost px-3 py-2 cursor-grab active:cursor-grabbing"
                            aria-label="Arrastar"
                            {...attributes}
                            {...listeners}
                        >
                            ⠿
                        </button>
                    </div>
                </div>

                {props.showDetails && <p className="text-sm text-[#546E7A] leading-relaxed">{props.task.description}</p>}

                {props.showNextStepHint && progress.total > 0 && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                        <p className="text-xs text-[#546E7A]">
                            Checklist: {progress.done}/{progress.total}
                        </p>
                        <p className="text-sm text-[#2C3E50] font-medium truncate">{next ? `Próximo: ${next.text}` : "Tudo concluído ✅"}</p>
                    </div>
                )}

                <PriorityPill priority={props.task.priority} />
            </div>
        </div>
    );
}

function PriorityPill({ priority }: { priority: TaskPriority }) {
    const cls =
        priority === "high"
            ? "bg-[#FFEBEE] text-[#C62828]"
            : priority === "medium"
                ? "bg-[#FFF8E1] text-[#FFBF00]"
                : "bg-[#E8F5E9] text-[#2E7D32]";

    return <span className={`inline-block text-xs px-3 py-1 rounded-full ${cls}`}>{priority}</span>;
}

function TaskModal(props: {
    mode: "create" | "edit";
    presetStatus?: TaskStatus;
    task?: Task;
    onClose: () => void;
    onCreate: (input: CreateTaskInput) => Promise<void>;
    onUpdate: (id: string, patch: UpdateTaskPatch) => Promise<void>;
}) {
    const isEdit = props.mode === "edit";

    const [title, setTitle] = React.useState(props.task?.title ?? "");
    const [description, setDescription] = React.useState(props.task?.description ?? "");
    const [status, setStatus] = React.useState<TaskStatus>(props.task?.status ?? props.presetStatus ?? "todo");
    const [priority, setPriority] = React.useState<TaskPriority>(props.task?.priority ?? "low");

    const [checklist, setChecklist] = React.useState<ChecklistItem[]>((props.task?.checklist as ChecklistItem[] | undefined) ?? []);
    const [newItemText, setNewItemText] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);

    const suggested = React.useMemo(() => suggestChecklistForStatus(status), [status]);

    function addItem() {
        const text = newItemText.trim();
        if (!text) return;
        setChecklist((prev) => [...prev, createChecklistItem(text)]);
        setNewItemText("");
    }

    function toggleItem(id: string) {
        setChecklist((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
    }

    function removeItem(id: string) {
        setChecklist((prev) => prev.filter((i) => i.id !== id));
    }

    function applySuggested() {
        if (checklist.length > 0) return;
        setChecklist(suggested);
    }

    async function handleSubmit() {
        setError(null);
        try {
            if (isEdit && props.task) {
                await props.onUpdate(props.task.id, { title, description, status, priority, checklist });
            } else {
                await props.onCreate({ title, description, status, priority, checklist });
            }
            props.onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Algo deu errado");
        }
    }

    const progress = getChecklistProgress(checklist);
    const next = getNextChecklistItem(checklist);

    return (
        <div className="fixed inset-0 z-[80] bg-black/30 flex items-center justify-center p-4">
            <div className="card w-full max-w-lg space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-2xl font-bold text-[#2C3E50]">{isEdit ? "Editar tarefa" : "Criar tarefa"}</h2>
                    <button type="button" className="btn-ghost" onClick={props.onClose}>
                        Fechar
                    </button>
                </div>

                {error && (
                    <div className="bg-[#FFEBEE] border border-[#C62828]/20 rounded-2xl p-3 text-sm text-[#2C3E50]">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-[#2C3E50]">
                        Título
                        <input className="input-field mt-2" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </label>

                    <label className="block text-sm font-medium text-[#2C3E50]">
                        Descrição
                        <textarea className="input-field mt-2" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="block text-sm font-medium text-[#2C3E50]">
                            Status
                            <select className="input-field mt-2" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
                                <option value="todo">To Do</option>
                                <option value="doing">Doing</option>
                                <option value="done">Done</option>
                            </select>
                        </label>

                        <label className="block text-sm font-medium text-[#2C3E50]">
                            Prioridade
                            <select className="input-field mt-2" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                                <option value="low">low</option>
                                <option value="medium">medium</option>
                                <option value="high">high</option>
                            </select>
                        </label>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-[#2C3E50]">Checklist</p>
                            <p className="text-xs text-[#546E7A]">
                                {progress.total === 0 ? "Use passos pequenos para reduzir sobrecarga." : `Progresso: ${progress.done}/${progress.total}`}
                            </p>
                            {next && <p className="text-xs text-[#546E7A]">Próximo: {next.text}</p>}
                        </div>

                        {checklist.length === 0 && suggested.length > 0 && (
                            <button type="button" className="btn-secondary" onClick={applySuggested}>
                                Usar sugestão
                            </button>
                        )}
                    </div>

                    {checklist.length > 0 ? (
                        <ul className="space-y-2">
                            {checklist.map((item) => (
                                <li key={item.id} className="flex items-center gap-3">
                                    <label className="flex items-center gap-3 flex-1">
                                        <input type="checkbox" checked={item.done} onChange={() => toggleItem(item.id)} />
                                        <span className={`text-sm ${item.done ? "line-through text-[#546E7A]" : "text-[#2C3E50]"}`}>{item.text}</span>
                                    </label>
                                    <button type="button" className="btn-ghost px-3 py-2" onClick={() => removeItem(item.id)} aria-label="Remover item">
                                        🗑️
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-[#546E7A]">Sem checklist ainda. Você pode começar pela sugestão.</p>
                    )}

                    <div className="flex gap-2">
                        <input
                            className="input-field"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder="Adicionar um passo pequeno…"
                        />
                        <button type="button" className="btn-primary" onClick={addItem}>
                            + Item
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button type="button" className="btn-secondary" onClick={props.onClose}>
                        Cancelar
                    </button>
                    <button type="button" className="btn-primary" onClick={() => void handleSubmit()}>
                        {isEdit ? "Salvar" : "Criar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function findTask(byStatus: Record<TaskStatus, Task[]>, activeId: string) {
    const id = activeId.replace("task:", "");
    for (const status of ["todo", "doing", "done"] as const) {
        const found = byStatus[status].find((t) => t.id === id);
        if (found) return found;
    }
    return null;
}

function parseOver(overId: string, byStatus: Record<TaskStatus, Task[]>) {
    if (overId.startsWith("col:")) {
        const status = overId.replace("col:", "") as TaskStatus;
        const idx = byStatus[status]?.length ?? 0;
        return { status, index: idx };
    }

    if (overId.startsWith("task:")) {
        const id = overId.replace("task:", "");
        for (const status of ["todo", "doing", "done"] as const) {
            const idx = byStatus[status].findIndex((t) => t.id === id);
            if (idx >= 0) return { status, index: idx };
        }
    }

    return null;
}
