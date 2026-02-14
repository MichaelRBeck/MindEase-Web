export type NavigationProfile = "simple" | "guided" | "power";
export type PreferredPeriod = "morning" | "afternoon" | "night";

export type UserNeeds = {
    shortTexts: boolean;
    reduceStimuli: boolean;
    highContrastPreferred: boolean;
    gentleReminders: boolean;
};

export type UserRoutine = {
    workOrStudy: "work" | "study";
    preferredFocusMinutes: number; // liga no Timer
    sessionsPerDayGoal: number; // meta simples
    preferredPeriod: PreferredPeriod;
};

export type UserProfile = {
    displayName: string;
    navigationProfile: NavigationProfile;
    needs: UserNeeds;
    routine: UserRoutine;
    updatedAt: number;
};

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
