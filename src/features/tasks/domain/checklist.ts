import type { TaskStatus } from "@/features/tasks/domain/task";

export type ChecklistItem = { id: string; text: string; done: boolean };

// Gera um id simples para os itens do checklist
function uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

// Cria item já normalizando o texto
export function createChecklistItem(text: string): ChecklistItem {
    return { id: uid(), text: text.trim(), done: false };
}

/**
 * Sugestões simples baseadas no status da tarefa
 * Ideia é sempre incentivar um próximo passo pequeno
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

// Retorna o próximo item não concluído
export function getNextChecklistItem(items?: ChecklistItem[]): ChecklistItem | null {
    if (!items || items.length === 0) return null;
    return items.find((i) => !i.done) ?? null;
}

// Calcula progresso simples do checklist
export function getChecklistProgress(
    items?: ChecklistItem[]
): { done: number; total: number } {
    const total = items?.length ?? 0;
    const done = items?.filter((i) => i.done).length ?? 0;
    return { done, total };
}
