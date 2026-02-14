import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils/renderWithProviders";

import { TasksProvider } from "@/features/tasks/presentation/TasksProvider";

jest.mock("@/features/cognitive/presentation/CognitiveProvider", () => ({
    CognitiveProvider: ({ children }: any) => children,
    useCognitive: () => ({
        applied: {
            detailMode: "summary",
            focusMode: false,
            animationsEnabled: false,
        },
        setFocusMode: jest.fn(),
        setDetailMode: jest.fn(),
        setAnimationsEnabled: jest.fn(),
    }),
}));

jest.mock("@/features/transitions/presentation/TransitionProvider", () => ({
    TransitionProvider: ({ children }: any) => children,
    useTransition: () => ({
        startTransition: jest.fn((fn?: any) => (typeof fn === "function" ? fn() : undefined)),
        isTransitioning: false,
    }),
}));

jest.mock("@/features/tasks/presentation/hooks/useTasksReduxBoard", () => ({
    useTasksReduxBoard: () => ({
        columns: [
            { id: "todo", title: "Todo", items: [{ id: "t1", title: "Ler artigo" }] },
            { id: "doing", title: "Doing", items: [] },
            { id: "done", title: "Done", items: [] },
        ],
        byStatus: {
            todo: [{ id: "t1", title: "Ler artigo" }],
            doing: [],
            done: [],
        },
        moveTask: jest.fn(),
        setActiveId: jest.fn(),
        activeId: null,
    }),
}));

import { KanbanBoard } from "@/features/tasks/presentation/components/KanbanBoard";

describe("<KanbanBoard />", () => {
    it("deve renderizar as colunas principais e tasks", () => {
        renderWithProviders(
            <TasksProvider>
                <KanbanBoard />
            </TasksProvider>,
            {
                preloadedState: {
                    tasks: {
                        uid: "user1",
                        items: [],
                        loading: false,
                        error: null,
                        hydrated: true,
                    },
                } as any,
            }
        );

        expect(screen.getByTestId("column-todo")).toBeInTheDocument();
        expect(screen.getByTestId("column-doing")).toBeInTheDocument();
        expect(screen.getByTestId("column-done")).toBeInTheDocument();
        expect(screen.getByTestId("task-card-t1")).toBeInTheDocument();
        expect(screen.getByText(/ler artigo/i)).toBeInTheDocument();
    });
});
