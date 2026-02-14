export type ComplexityLevel = "simple" | "medium" | "detailed";
export type ContrastLevel = "normal" | "high";
export type DetailMode = "summary" | "detailed";
export type NavigationStyle = "sidebar" | "bottom";

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
    alertThresholdMinutes: number; // ex: 3,5,10
};

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
