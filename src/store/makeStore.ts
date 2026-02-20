import { configureStore, combineReducers } from "@reduxjs/toolkit";

import tasksReducer from "@/features/tasks/presentation/store/tasksSlice";
import authReducer from "@/features/auth/presentation/store/authSlice";

// Junta os slices num reducer único
const rootReducer = combineReducers({
    auth: authReducer,
    tasks: tasksReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// Factory do store pra suportar preloadedState no SSR
export function makeStore(preloadedState?: Partial<RootState>) {
    return configureStore({
        reducer: rootReducer,
        preloadedState: preloadedState as RootState,
        devTools: process.env.NODE_ENV !== "production",
    });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
