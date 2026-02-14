import type { TaskStatus } from "@/features/tasks/domain/task";

export type ChecklistItem = { id: string; text: string; done: boolean };

function uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function createChecklistItem(text: string): ChecklistItem {
    return { id: uid(), text: text.trim(), done: false };
}

/**
 * “Inteligente” simples (hackathon):
 * Sugestões curtas que reduzem sobrecarga e incentivam "próximo passo".
 */
export function suggestChecklistForStatus(status: TaskStatus): ChecklistItem[] {
    const texts =
        status === "todo"
            ? ["Definir o próximo passo", "Separar materiais/links", "Começar por 5 minutos"]
            : status === "doing"
                ? ["Continuar do último ponto", "Checar progresso", "Preparar finalização"]
                : [];

    return texts.map(createChecklistItem);
}

export function getNextChecklistItem(items?: ChecklistItem[]): ChecklistItem | null {
    if (!items || items.length === 0) return null;
    return items.find((i) => !i.done) ?? null;
}

export function getChecklistProgress(items?: ChecklistItem[]): { done: number; total: number } {
    const total = items?.length ?? 0;
    const done = items?.filter((i) => i.done).length ?? 0;
    return { done, total };
}
