"use client";

import * as React from "react";
import { useCognitive } from "@/features/cognitive/presentation/CognitiveProvider";

export function CognitivePanelPage() {
    // Vem do CognitiveProvider e controla as preferências do painel
    const cognitive = useCognitive();

    const d = cognitive.draft; // rascunho editável (antes de aplicar)

    const spacingMultiplier = typeof d.spacingMultiplier === "number" ? d.spacingMultiplier : 1.0;
    const fontSizeMultiplier = typeof d.fontSizeMultiplier === "number" ? d.fontSizeMultiplier : 1.0;
    const lineSpacing = typeof d.lineSpacing === "number" ? d.lineSpacing : 1.5;

    const [saving, setSaving] = React.useState(false);

    // Aplica as mudanças do rascunho e salva as preferências
    async function handleApply() {
        setSaving(true);
        try {
            await cognitive.applyDraft();
        } finally {
            setSaving(false);
        }
    }

    return (
        <main data-testid="cognitive-panel-container" className="min-h-screen bg-[#F4F4F9]">
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                <header className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground">Painel Cognitivo</h1>
                    <p className="text-lg text-muted-foreground">
                        Ajuste a interface para reduzir esforço mental e manter previsibilidade.
                    </p>
                </header>

                {/* Ações principais do painel */}
                <section className="card flex flex-col md:flex-row md:items-center gap-3 justify-between">
                    <div className="space-y-1">
                        <p className="font-bold text-foreground">Alterações</p>
                        <p className="text-sm text-muted-foreground">
                            {cognitive.hasPendingChanges ? "Você tem alterações pendentes." : "Nenhuma alteração pendente."}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={cognitive.resetDraft}
                            disabled={!cognitive.hasPendingChanges || saving}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => void handleApply()}
                            disabled={!cognitive.hasPendingChanges || saving}
                        >
                            {saving ? "Aplicando..." : "Aplicar"}
                        </button>
                    </div>
                </section>

                {/* Complexidade da interface */}
                <section className="card space-y-4" aria-label="Complexidade da interface">
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Complexidade da interface</h2>
                        <p className="text-sm text-muted-foreground">Controla a densidade de informação na tela.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {(["simple", "medium", "detailed"] as const).map((level) => {
                            const label = level === "simple" ? "simples" : level === "medium" ? "média" : "detalhada";

                            return (
                                <PillButton
                                    key={level}
                                    testId={`complexity-${level}-btn`}
                                    active={d.complexityLevel === level}
                                    onClick={() => cognitive.updateDraft({ complexityLevel: level })}
                                >
                                    {label}
                                </PillButton>
                            );
                        })}
                    </div>
                </section>

                {/* Modo foco */}
                <section className="card space-y-4" aria-label="Modo foco">
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Modo foco</h2>
                        <p className="text-sm text-muted-foreground">Esconde elementos não essenciais (ex.: menu lateral).</p>
                    </div>

                    <PillButton
                        testId="focus-mode-toggle"
                        active={d.focusMode}
                        onClick={() => cognitive.updateDraft({ focusMode: !d.focusMode })}
                    >
                        {d.focusMode ? "ativado" : "desativado"}
                    </PillButton>
                </section>

                {/* Resumo / detalhado */}
                <section className="card space-y-4" aria-label="Modo de detalhe">
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Resumo / detalhado</h2>
                        <p className="text-sm text-muted-foreground">Controla o quanto de detalhe aparece em cards e telas.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {(["summary", "detailed"] as const).map((mode) => {
                            const label = mode === "summary" ? "resumo" : "detalhado";

                            return (
                                <PillButton
                                    key={mode}
                                    testId={`detail-${mode}-btn`}
                                    active={d.detailMode === mode}
                                    onClick={() => cognitive.updateDraft({ detailMode: mode })}
                                >
                                    {label}
                                </PillButton>
                            );
                        })}
                    </div>
                </section>

                {/* Tamanho da fonte */}
                <section className="card space-y-4" aria-label="Tamanho da fonte">
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Tamanho da fonte</h2>
                        <p className="text-sm text-muted-foreground">Ajusta o tamanho do texto para conforto.</p>
                    </div>

                    <SliderRow
                        testId="font-size-slider"
                        min={0.8}
                        max={1.5}
                        step={0.1}
                        value={fontSizeMultiplier}
                        onChange={(v) => cognitive.updateDraft({ fontSizeMultiplier: v })}
                        label={`Escala: ${fontSizeMultiplier.toFixed(1)}x`}
                    />
                </section>

                {/* Espaçamento */}
                <section className="card space-y-4" aria-label="Espaçamento">
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Espaçamento</h2>
                        <p className="text-sm text-muted-foreground">Aumenta/diminui espaços para reduzir “poluição”.</p>
                    </div>

                    <SliderRow
                        testId="spacing-slider"
                        min={0.8}
                        max={1.5}
                        step={0.1}
                        value={spacingMultiplier}
                        onChange={(v) => cognitive.updateDraft({ spacingMultiplier: v })}
                        label={`Espaçamento: ${spacingMultiplier.toFixed(1)}x`}
                    />
                </section>

                {/* Espaçamento de linha */}
                <section className="card space-y-4" aria-label="Espaçamento de linha">
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Espaçamento de linha</h2>
                        <p className="text-sm text-muted-foreground">Ajusta o espaço entre linhas para leitura confortável.</p>
                    </div>

                    <SliderRow
                        testId="line-spacing-slider"
                        min={1.2}
                        max={2.0}
                        step={0.1}
                        value={lineSpacing}
                        onChange={(v) => cognitive.updateDraft({ lineSpacing: v })}
                        label={`Linha: ${lineSpacing.toFixed(1)}`}
                    />
                </section>

                {/* Contraste */}
                <section className="card space-y-4" aria-label="Contraste">
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Contraste</h2>
                        <p className="text-sm text-muted-foreground">Altera contraste para melhorar leitura.</p>
                    </div>

                    <div className="flex gap-3">
                        {(["normal", "high"] as const).map((level) => {
                            const label = level === "normal" ? "normal" : "alto";

                            return (
                                <PillButton
                                    key={level}
                                    testId={`contrast-${level}-btn`}
                                    active={d.contrastLevel === level}
                                    onClick={() => cognitive.updateDraft({ contrastLevel: level })}
                                >
                                    {label}
                                </PillButton>
                            );
                        })}
                    </div>
                </section>

                {/* Alertas cognitivos */}
                <section className="card space-y-4" aria-label="Alertas cognitivos">
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Alertas cognitivos</h2>
                        <p className="text-sm text-muted-foreground">
                            Lembretes gentis para evitar “ficar preso” muito tempo numa tarefa/tela.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <PillButton
                            testId="alerts-toggle"
                            active={d.cognitiveAlertsEnabled}
                            onClick={() => cognitive.updateDraft({ cognitiveAlertsEnabled: !d.cognitiveAlertsEnabled })}
                        >
                            {d.cognitiveAlertsEnabled ? "ativado" : "desativado"}
                        </PillButton>

                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-foreground mb-2">Alertar após (minutos)</label>
                            <select
                                data-testid="alerts-threshold-select"
                                className="input-field"
                                value={d.alertThresholdMinutes}
                                onChange={(e) => cognitive.updateDraft({ alertThresholdMinutes: Number(e.target.value) })}
                            >
                                {[3, 5, 10, 15, 20].map((m) => (
                                    <option key={m} value={m}>
                                        {m} min
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-[#FFF8E1] border border-[#FFBF00]/30 rounded-2xl p-4">
                        <p className="text-sm text-[#2C3E50] leading-relaxed">
                            💡 Exemplo: “Você está há um tempo nessa tarefa. Quer pausar, revisar ou trocar de atividade?”
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

function PillButton(props: { children: React.ReactNode; active: boolean; onClick: () => void; testId: string }) {
    return (
        <button
            type="button"
            data-testid={props.testId}
            onClick={props.onClick}
            className={`px-6 py-3 rounded-full font-bold capitalize transition-colors ${props.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-border text-foreground hover:border-ring"
                }`}
        >
            {props.children}
        </button>
    );
}

function SliderRow(props: {
    testId: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (v: number) => void;
    label: string;
}) {
    return (
        <div className="space-y-3">
            <input
                data-testid={props.testId}
                type="range"
                min={props.min}
                max={props.max}
                step={props.step}
                value={props.value}
                onChange={(e) => props.onChange(Number(e.target.value))}
                className="w-full"
            />
            <p className="text-sm text-foreground">{props.label}</p>
        </div>
    );
}
