import React from "react";
import { render, screen } from "@testing-library/react";

import { Sidebar } from "@/features/navigation/presentation/components/Sidebar";

// ---- mocks ----
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

describe("<Sidebar />", () => {
    beforeEach(() => {
        pathnameValue = "/tasks";
        focusModeValue = false;
        navProfileValue = "simple";
    });

    it("deve ocultar a sidebar quando Focus Mode estiver ativo", () => {
        focusModeValue = true;

        render(<Sidebar />);

        expect(screen.queryByTestId("desktop-navigation")).not.toBeInTheDocument();
        expect(screen.queryByTestId("mobile-navigation")).not.toBeInTheDocument();
    });

    it("simple: deve mostrar badge e itens reduzidos (Dashboard/Tasks/Timer/Settings)", () => {
        navProfileValue = "simple";
        pathnameValue = "/tasks";

        render(<Sidebar />);

        expect(screen.getByTestId("desktop-navigation")).toBeInTheDocument();

        expect(screen.getByText(/simple navigation/i)).toBeInTheDocument();

        expect(screen.getByTestId("nav-dashboard")).toBeInTheDocument();
        expect(screen.getByTestId("nav-tasks")).toBeInTheDocument();
        expect(screen.getByTestId("nav-timer")).toBeInTheDocument();
        expect(screen.getByTestId("nav-settings")).toBeInTheDocument();

        expect(screen.getByTestId("nav-mobile-dashboard")).toBeInTheDocument();
        expect(screen.getByTestId("nav-mobile-tasks")).toBeInTheDocument();

        expect(screen.getByTestId("nav-tasks")).toHaveAttribute("aria-current", "page");
        expect(screen.getByTestId("nav-mobile-tasks")).toHaveAttribute("aria-current", "page");

        expect(screen.getAllByText(/profile/i).length).toBeGreaterThanOrEqual(1);

        const activeLinks = screen.getAllByRole("link", { name: /tasks/i });
        expect(activeLinks.some((a) => a.getAttribute("aria-current") === "page")).toBe(true);
    });

    it("power: deve mostrar Quick actions", () => {
        navProfileValue = "power";

        render(<Sidebar />);

        expect(screen.getByText(/power navigation/i)).toBeInTheDocument();

        expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /\+ add task/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /start timer/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /adjust cognitive panel/i })).toBeInTheDocument();
    });
});
