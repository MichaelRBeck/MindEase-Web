// Define como o menu principal será exibido na aplicação
export type NavigationProfile = "simple" | "guided" | "power";

// Preferência de período do dia (usado para rotina e possíveis ajustes futuros)
export type PreferredPeriod = "morning" | "afternoon" | "night";

// Necessidades cognitivas que influenciam o Painel Cognitivo automaticamente
export type UserNeeds = {
    shortTexts: boolean;
    reduceStimuli: boolean;
    highContrastPreferred: boolean;
    gentleReminders: boolean;
};

// Preferências relacionadas à rotina de foco/estudo
export type UserRoutine = {
    workOrStudy: "work" | "study";
    preferredFocusMinutes: number; // usado como default no Timer
    sessionsPerDayGoal: number; // meta simples diária
    preferredPeriod: PreferredPeriod;
};

// Estrutura persistida do perfil do usuário
export type UserProfile = {
    displayName: string;
    navigationProfile: NavigationProfile;
    needs: UserNeeds;
    routine: UserRoutine;
    updatedAt: number; // timestamp de última atualização
};

// Estado inicial padrão usado quando não há perfil salvo no banco
export const DEFAULT_USER_PROFILE: UserProfile = {
    displayName: "User",
    navigationProfile: "guided",
    needs: {
        shortTexts: true,
        reduceStimuli: false,
        highContrastPreferred: false,
        gentleReminders: true,
    },
    routine: {
        workOrStudy: "study",
        preferredFocusMinutes: 25,
        sessionsPerDayGoal: 4,
        preferredPeriod: "morning",
    },
    updatedAt: Date.now(),
};
