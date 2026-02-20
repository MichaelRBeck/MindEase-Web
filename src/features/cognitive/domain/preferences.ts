// Níveis de complexidade visual da interface
export type ComplexityLevel = "simple" | "medium" | "detailed";

// Contraste de cores aplicado na UI
export type ContrastLevel = "normal" | "high";

// Modo de exibição de conteúdo (resumido ou completo)
export type DetailMode = "summary" | "detailed";

// Estilo principal de navegação
export type NavigationStyle = "sidebar" | "bottom";

// Preferências cognitivas persistidas por usuário
export type CognitivePreferences = {
    complexityLevel: ComplexityLevel;
    focusMode: boolean;

    detailMode: DetailMode;

    fontSizeMultiplier: number; // 0.8 - 1.5
    lineSpacing: number; // 1.2 - 2.0
    spacingMultiplier: number; // 0.8 - 1.5
    contrastLevel: ContrastLevel;

    animationsEnabled: boolean;
    navigationStyle: NavigationStyle;

    cognitiveAlertsEnabled: boolean;
    alertThresholdMinutes: number; // ex: 3, 5, 10
};

// Valores padrão aplicados quando não há preferências salvas
export const DEFAULT_COGNITIVE_PREFS: CognitivePreferences = {
    complexityLevel: "medium",
    focusMode: false,

    detailMode: "summary",

    fontSizeMultiplier: 1.0,
    lineSpacing: 1.5,
    spacingMultiplier: 1.0,
    contrastLevel: "normal",

    animationsEnabled: true,
    navigationStyle: "sidebar",

    cognitiveAlertsEnabled: true,
    alertThresholdMinutes: 5,
};
