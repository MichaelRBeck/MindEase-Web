import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthState = {
    uid: string | null;
    status: AuthStatus;
};

const initialState: AuthState = {
    uid: null,
    status: "loading",
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthState(state, action: PayloadAction<{ uid: string | null; status: AuthStatus }>) {
            state.uid = action.payload.uid;
            state.status = action.payload.status;
        },
        clearAuthState(state) {
            state.uid = null;
            state.status = "anonymous";
        },
    },
});

export const { setAuthState, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
