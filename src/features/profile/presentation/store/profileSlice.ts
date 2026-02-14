import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserProfile } from "@/features/profile/domain/userProfile";
import { DEFAULT_USER_PROFILE } from "@/features/profile/domain/userProfile";

type ProfileState = {
    data: UserProfile;
    hydrated: boolean;
};

const initialState: ProfileState = { data: DEFAULT_USER_PROFILE, hydrated: false };

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        hydrateFromServer(state, action: PayloadAction<UserProfile>) {
            state.data = action.payload;
            state.hydrated = true;
        },
        clearProfile(state) {
            state.data = DEFAULT_USER_PROFILE;
            state.hydrated = false;
        },
    },
});

export const { hydrateFromServer, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
