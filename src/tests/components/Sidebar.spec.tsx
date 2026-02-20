import { render, screen } from "@testing-library/react";

import { Sidebar } from "@/features/navigation/presentation/components/Sidebar";

let pathnameValue = "/tasks";
let focusModeValue = false;
let navProfileValue: "simple" | "guided" | "power" = "simple";

jest.mock("next/navigation", () => ({
    usePathname: () => pathnameValue,
}));

jest.mock("@/features/cognitive/presentation/CognitiveProvider", () => ({
    useCognitive: () => ({
        applied: {
            focusMode: focusModeValue,
        },
    }),
}));

jest.mock("@/features/profile/presentation/hooks/useUserProfile", () => ({
    useUserProfile: () => ({
        profile: {
            navigationProfile: navProfileValue,
        },
        hydrated: true,
    }),
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

// Pega 1 link pelo href (bem útil pra validar rotas sem depender do texto)
function findLinkByHref(href: string) {
    return screen.getAllByRole("link").find((a) => a.getAttribute("href") === href) ?? null;
}

describe("<Sidebar />", () => {
    beforeEach(() => {
        pathnameValue = "/tasks";
        focusModeValue = false;
        navProfileValue = "simple";
    });

    it("deve ocultar a sidebar quando o modo foco estiver ativo", () => {
        focusModeValue = true;

        render(<Sidebar />);

        expect(screen.queryByTestId("desktop-navigation")).not.toBeInTheDocument();
        expect(screen.queryByTestId("mobile-navigation")).not.toBeInTheDocument();
    });

    it("simple: deve mostrar menu reduzido e marcar /tasks como ativo", () => {
        navProfileValue = "simple";
        pathnameValue = "/tasks";

        render(<Sidebar />);

        expect(screen.getByTestId("desktop-navigation")).toBeInTheDocument();
        expect(screen.getByTestId("mobile-navigation")).toBeInTheDocument();

        // Itens do perfil simples (por rota)
        expect(findLinkByHref("/dashboard")).toBeTruthy();
        expect(findLinkByHref("/tasks")).toBeTruthy();
        expect(findLinkByHref("/timer")).toBeTruthy();
        expect(findLinkByHref("/settings")).toBeTruthy();

        // /profile e /panel não ficam no menu principal do simple, mas aparecem como atalhos no final
        expect(findLinkByHref("/profile")).toBeTruthy();
        expect(findLinkByHref("/panel")).toBeTruthy();

        // Um dos links de /tasks deve estar marcado como ativo (desktop ou mobile)
        const activeTasks = screen
            .getAllByRole("link")
            .filter((a) => a.getAttribute("href") === "/tasks")
            .some((a) => a.getAttribute("aria-current") === "page");

        expect(activeTasks).toBe(true);
    });

    it("power: deve mostrar ações rápidas", () => {
        navProfileValue = "power";

        render(<Sidebar />);

        // Texto do bloco (PT ou fallback em inglês)
        expect(screen.getByText(/ações rápidas|quick actions/i)).toBeInTheDocument();

        // Links do bloco (por rota)
        expect(findLinkByHref("/tasks")).toBeTruthy();
        expect(findLinkByHref("/timer")).toBeTruthy();
        expect(findLinkByHref("/panel")).toBeTruthy();
    });
});
