"use client";

import * as React from "react";
import { Provider as ReduxProvider } from "react-redux";
import type { RootState } from "@/store/makeStore";
import { makeStore } from "@/store/makeStore";

export function StoreProvider(props: { children: React.ReactNode; preloadedState?: RootState }) {
    // Cria o store com estado vindo do SSR (quando tiver)
    const store = React.useMemo(() => makeStore(props.preloadedState), [props.preloadedState]);

    return <ReduxProvider store={store}>{props.children}</ReduxProvider>;
}
