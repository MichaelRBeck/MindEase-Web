import { makeStore } from "./makeStore";

// Tipos do Redux (store, state e dispatch)
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Store "default" (útil em casos fora do SSR)
export const store = makeStore();
