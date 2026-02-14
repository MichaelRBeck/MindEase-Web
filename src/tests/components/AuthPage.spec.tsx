import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";

import { AuthPage } from "@/features/auth/presentation/pages/AuthPage";

// ---- mocks ----
const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        replace: replaceMock,
        push: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
}));

const signInMock = jest.fn();
const signUpMock = jest.fn();
const signOutMock = jest.fn();

jest.mock("@/features/auth/presentation/AuthProvider", () => ({
    useAuth: () => ({
        signIn: signInMock,
        signUp: signUpMock,
        signOut: signOutMock,
        status: "unauthenticated",
        user: null,
    }),
}));

describe("<AuthPage />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve renderizar o formulário de login", () => {
        render(<AuthPage />);

        expect(screen.getByTestId("auth-container")).toBeInTheDocument();
        expect(screen.getByTestId("auth-form")).toBeInTheDocument();
        expect(screen.getByTestId("auth-email-input")).toBeInTheDocument();
        expect(screen.getByTestId("auth-password-input")).toBeInTheDocument();
        expect(screen.getByTestId("auth-submit-btn")).toBeInTheDocument();

        // no modo login, não aparece nome/confirm
        expect(screen.queryByTestId("auth-name-input")).not.toBeInTheDocument();
        expect(screen.queryByTestId("auth-confirm-password-input")).not.toBeInTheDocument();
    });

    it("deve validar campos obrigatórios e não chamar signIn", async () => {
        const user = userEvent.setup();
        render(<AuthPage />);

        await user.click(screen.getByTestId("auth-submit-btn"));

        expect(await screen.findByRole("alert")).toHaveTextContent(/please enter your email/i);
        expect(signInMock).not.toHaveBeenCalled();
        expect(replaceMock).not.toHaveBeenCalled();
    });

    it("login: deve chamar signIn e redirecionar para /dashboard", async () => {
        const user = userEvent.setup();
        signInMock.mockResolvedValueOnce(undefined);

        render(<AuthPage />);

        await user.type(screen.getByTestId("auth-email-input"), "test@email.com");
        await user.type(screen.getByTestId("auth-password-input"), "123456");

        await user.click(screen.getByTestId("auth-submit-btn"));

        expect(signInMock).toHaveBeenCalledTimes(1);
        expect(signInMock).toHaveBeenCalledWith("test@email.com", "123456");
        expect(replaceMock).toHaveBeenCalledWith("/dashboard");
    });

    it("signup: deve mostrar erro quando senhas não batem", async () => {
        const user = userEvent.setup();
        render(<AuthPage />);

        // troca para signup
        await user.click(screen.getByTestId("auth-toggle-btn"));

        // agora os campos aparecem
        expect(screen.getByTestId("auth-name-input")).toBeInTheDocument();
        expect(screen.getByTestId("auth-confirm-password-input")).toBeInTheDocument();

        await user.type(screen.getByTestId("auth-email-input"), "test@email.com");
        await user.type(screen.getByTestId("auth-password-input"), "123456");
        await user.type(screen.getByTestId("auth-confirm-password-input"), "000000");
        await user.type(screen.getByTestId("auth-name-input"), "Mike");

        await user.click(screen.getByTestId("auth-submit-btn"));

        expect(await screen.findByRole("alert")).toHaveTextContent(/passwords do not match/i);
        expect(signUpMock).not.toHaveBeenCalled();
        expect(replaceMock).not.toHaveBeenCalled();
    });
});
