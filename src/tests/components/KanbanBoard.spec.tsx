import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils/renderWithProviders";

import { TasksProvider } from "@/features/tasks/presentation/TasksProvider";
import { KanbanBoard } from "@/features/tasks/presentation/components/KanbanBoard";

// Mock do estado cognitivo que influencia o board (detalhe, foco e animações)
jest.mock("@/features/cognitive/presentation/CognitiveProvider", () => ({
    useCognitive: () => ({
        applied: {
            detailMode: "summary",
            focusMode: false,
            animationsEnabled: false,
        },
    }),
}));

// Mock do toast de transição (no Kanban a gente só usa transition.show)
const showMock = jest.fn();

jest.mock("@/features/transitions/presentation/TransitionProvider", () => ({
    useTransition: () => ({
        show: showMock,
        dismiss: jest.fn(),
        current: null,
    }),
}));

// Mock do hook que o TasksProvider usa por baixo
jest.mock("@/features/tasks/presentation/hooks/useTasksReduxBoard", () => ({
    useTasksReduxBoard: () => ({
        items: [{ id: "t1", title: "Ler artigo", status: "todo" }],
        byStatus: {
            todo: [{ id: "t1", title: "Ler artigo", description: "", priority: "low", status: "todo" }],
            doing: [],
            done: [],
        },
        loading: false,
        error: null,
        hydrated: true,
        add: jest.fn(),
        edit: jest.fn(),
        remove: jest.fn(),
        move: jest.fn(),
        actions: {
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            move: jest.fn(),
        },
    }),
}));

describe("<KanbanBoard />", () => {
    it("deve renderizar as colunas principais e uma task", () => {
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
