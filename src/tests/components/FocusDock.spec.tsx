import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FocusDock } from "@/features/navigation/presentation/components/FocusDock";

// Mock do applyPatch pra simular sair do modo foco
const applyPatchMock = jest.fn();

let focusModeValue = true;

jest.mock("@/features/cognitive/presentation/CognitiveProvider", () => ({
    useCognitive: () => ({
        applied: {
            focusMode: focusModeValue,
        },
        applyPatch: applyPatchMock,
    }),
}));

jest.mock("@/features/timer/presentation/TimerProvider", () => ({
    useTimer: () => ({
        state: {
            phase: "focus",
            secondsLeft: 25 * 60,
            isRunning: false,
        },
        config: {
            focusMinutes: 25,
            shortBreakMinutes: 5,
            longBreakMinutes: 15,
        },
    }),
}));

jest.mock("next/navigation", () => ({
    usePathname: () => "/tasks",
}));

jest.mock("next/link", () => {
    return function Link({ href, children, ...props }: any) {
        return (
            <a href={href} {...props}>
                {children}
            </a>
        );
    };
});

describe("<FocusDock />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        focusModeValue = true;
    });

    it("não deve renderizar quando focusMode=false", () => {
        focusModeValue = false;

        render(<FocusDock />);
        expect(screen.queryByTestId("focus-menu-btn")).not.toBeInTheDocument();
    });

    it("deve abrir e fechar o menu ao clicar no botão Menu/Fechar", async () => {
        const user = userEvent.setup();
        render(<FocusDock />);

        const btn = screen.getByTestId("focus-menu-btn");
        expect(btn).toHaveTextContent(/menu/i);

        await user.click(btn);

        // Menu aberto
        expect(screen.getByRole("navigation", { name: /navega(c|ç)ão.*foco/i })).toBeInTheDocument();
        expect(btn).toHaveTextContent(/fechar/i);

        // Fecha clicando no botão novamente
        await user.click(btn);
        expect(screen.queryByRole("navigation", { name: /navega(c|ç)ão.*foco/i })).not.toBeInTheDocument();
    });

    it("deve fechar o menu ao pressionar Escape", async () => {
        const user = userEvent.setup();
        render(<FocusDock />);

        await user.click(screen.getByTestId("focus-menu-btn"));
        expect(screen.getByRole("navigation", { name: /navega(c|ç)ão.*foco/i })).toBeInTheDocument();

        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.queryByRole("navigation", { name: /navega(c|ç)ão.*foco/i })).not.toBeInTheDocument();
    });

    it("Sair do modo foco: deve chamar applyPatch e fechar o menu", async () => {
        const user = userEvent.setup();
        applyPatchMock.mockResolvedValueOnce(undefined);

        render(<FocusDock />);

        // Abre o menu
        await user.click(screen.getByTestId("focus-menu-btn"));
        expect(screen.getByRole("navigation", { name: /navega(c|ç)ão.*foco/i })).toBeInTheDocument();

        // Sai do foco
        await user.click(screen.getByRole("button", { name: /sair.*modo.*foco/i }));

        expect(applyPatchMock).toHaveBeenCalledTimes(1);
        expect(applyPatchMock).toHaveBeenCalledWith({ focusMode: false });

        // Depois do await, ele fecha
        expect(screen.queryByRole("navigation", { name: /navega(c|ç)ão.*foco/i })).not.toBeInTheDocument();
    });
});
