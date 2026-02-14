import React, { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { render, type RenderOptions } from "@testing-library/react";

import { makeStore } from "@/store/makeStore";
import type { RootState, AppStore } from "@/store";

type ExtendedRenderOptions = Omit<RenderOptions, "queries"> & {
    preloadedState?: Partial<RootState>;
    store?: AppStore;
};

export function renderWithProviders(
    ui: React.ReactElement,
    { preloadedState, store = makeStore(preloadedState as RootState), ...renderOptions }: ExtendedRenderOptions = {}
) {
    function Wrapper({ children }: PropsWithChildren) {
        return <Provider store={store}>{children}</Provider>;
    }

    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
