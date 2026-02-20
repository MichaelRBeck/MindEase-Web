import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserProfile } from "@/features/profile/domain/userProfile";
import { DEFAULT_USER_PROFILE } from "@/features/profile/domain/userProfile";

// Estado global do perfil dentro do Redux
type ProfileState = {
    data: UserProfile;
    hydrated: boolean; // indica se já foi carregado do servidor (SSR ou client)
};

const initialState: ProfileState = {
    data: DEFAULT_USER_PROFILE,
    hydrated: false,
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        // Usado para hidratar o perfil vindo do servidor (SSR)
        hydrateFromServer(state, action: PayloadAction<UserProfile>) {
            state.data = action.payload;
            state.hydrated = true;
        },

        // Limpa o estado ao deslogar
        clearProfile(state) {
            state.data = DEFAULT_USER_PROFILE;
            state.hydrated = false;
        },
    },
});

export const { hydrateFromServer, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
