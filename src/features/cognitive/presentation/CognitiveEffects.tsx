"use client";

import * as React from "react";
import { useCognitive } from "@/features/cognitive/presentation/CognitiveProvider";

export function CognitiveEffects() {
    const { applied } = useCognitive();

    React.useEffect(() => {
        const root = document.documentElement;

        // Normaliza valores pra não quebrar CSS se vier algo estranho
        const fontScale = Number.isFinite(applied.fontSizeMultiplier) ? applied.fontSizeMultiplier : 1;
        const line = Number.isFinite(applied.lineSpacing) ? applied.lineSpacing : 1.5;
        const space = Number.isFinite(applied.spacingMultiplier) ? applied.spacingMultiplier : 1;

        // Variáveis CSS usadas pelos componentes (fonte, espaçamento e tokens)
        root.style.setProperty("--me-font-scale", String(fontScale));
        root.style.setProperty("--me-line-height", String(line));
        root.style.setProperty("--me-space", String(space));

        // Tokens derivados do espaçamento (pra manter tudo proporcional)
        root.style.setProperty("--me-card-padding", `${1.5 * space}rem`);
        root.style.setProperty("--me-card-padding-md", `${2.0 * space}rem`);
        root.style.setProperty("--me-interactive-padding", `${1.5 * space}rem`);
        root.style.setProperty("--me-input-py", `${0.75 * space}rem`);
        root.style.setProperty("--me-input-px", `${1.0 * space}rem`);
        root.style.setProperty("--me-btn-py", `${0.75 * space}rem`);
        root.style.setProperty("--me-btn-px-primary", `${2.0 * space}rem`);
        root.style.setProperty("--me-btn-px-secondary", `${2.0 * space}rem`);
        root.style.setProperty("--me-btn-px-ghost", `${1.5 * space}rem`);

        // Flags pra UI reagir via CSS (contraste, animações, foco, etc.)
        root.dataset.contrast = applied.contrastLevel ?? "normal";
        root.dataset.animations = applied.animationsEnabled ? "on" : "off";
        root.dataset.focus = applied.focusMode ? "on" : "off";
        root.dataset.complexity = applied.complexityLevel;
        root.dataset.detail = applied.detailMode;
    }, [applied]);

    return null;
}
