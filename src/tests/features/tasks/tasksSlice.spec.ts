import { configureStore } from "@reduxjs/toolkit";

import tasksReducer, {
    clearTasks,
    hydrateFromServer,
    fetchTasks,
    removeTask,
} from "@/features/tasks/presentation/store/tasksSlice";

import type { Task } from "@/features/tasks/domain/task";

// Mock do repo do Firebase (classe instanciada com new)
const listMock = jest.fn();
const removeMock = jest.fn();

jest.mock("@/features/tasks/data/firebaseTasksRepository", () => {
    return {
        FirebaseTasksRepository: jest.fn().mockImplementation((_uid: string) => ({
            list: listMock,
            remove: removeMock,
            create: jest.fn(),
            update: jest.fn(),
            move: jest.fn(),
        })),
    };
});

function makeStore(preloadedTasksState?: any) {
    return configureStore({
        reducer: { tasks: tasksReducer },
        preloadedState: preloadedTasksState ? { tasks: preloadedTasksState } : undefined,
    });
}

describe("tasksSlice", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("reducers: hydrateFromServer deve setar uid, items e hydrated=true", () => {
        const store = makeStore();

        const items: Task[] = [
            {
                id: "t1",
                title: "Estudar",
                status: "todo" as any,
                createdAt: Date.now() as any,
                updatedAt: Date.now() as any,
                description: "",
                priority: "low",
            },
        ];

        store.dispatch(hydrateFromServer({ uid: "user1", items }));

        const state = store.getState().tasks;
        expect(state.uid).toBe("user1");
        expect(state.items).toHaveLength(1);
        expect(state.hydrated).toBe(true);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it("reducers: clearTasks deve limpar tudo e hydrated=false", () => {
        const store = makeStore({
            uid: "user1",
            items: [{ id: "t1" }],
            loading: true,
            error: "x",
            hydrated: true,
        });

        store.dispatch(clearTasks());

        const state = store.getState().tasks;
        expect(state.uid).toBeNull();
        expect(state.items).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.hydrated).toBe(false);
    });

    it("extraReducers: fetchTasks.pending deve setar loading=true e uid do request", async () => {
        const store = makeStore();

        listMock.mockResolvedValueOnce([]);
        const promise = store.dispatch(fetchTasks({ uid: "user1" }));

        const pendingState = store.getState().tasks;
        expect(pendingState.loading).toBe(true);
        expect(pendingState.error).toBeNull();
        expect(pendingState.uid).toBe("user1");

        await promise;
    });

    it("thunk: fetchTasks.fulfilled deve colocar items e hydrated=true", async () => {
        const store = makeStore();

        const items: Task[] = [
            {
                id: "t1",
                title: "Ler",
                status: "todo" as any,
                description: "",
                priority: "low" as any,
                createdAt: Date.now() as any,
                updatedAt: Date.now() as any,
            },
        ];

        listMock.mockResolvedValueOnce(items);

        await store.dispatch(fetchTasks({ uid: "user1" }));

        const state = store.getState().tasks;
        expect(listMock).toHaveBeenCalledTimes(1);
        expect(state.loading).toBe(false);
        expect(state.items).toEqual(items);
        expect(state.hydrated).toBe(true);
    });

    it("thunk: fetchTasks.rejected deve setar error e hydrated=true", async () => {
        const store = makeStore();

        listMock.mockRejectedValueOnce(new Error("boom"));

        await store.dispatch(fetchTasks({ uid: "user1" }));

        const state = store.getState().tasks;

        expect(state.loading).toBe(false);
        expect(state.hydrated).toBe(true);
        expect(typeof state.error).toBe("string");
        expect(state.error!).toMatch(/boom|Failed to load tasks/i);
    });

    it("thunk: removeTask deve chamar repo.remove e remover item do state", async () => {
        const store = makeStore({
            uid: "user1",
            items: [
                { id: "t1", title: "A" },
                { id: "t2", title: "B" },
            ],
            loading: false,
            error: null,
            hydrated: true,
        });

        removeMock.mockResolvedValueOnce(undefined);

        await store.dispatch(removeTask({ uid: "user1", id: "t1" }));

        expect(removeMock).toHaveBeenCalledTimes(1);
        expect(removeMock).toHaveBeenCalledWith("t1");

        const state = store.getState().tasks;
        expect(state.items.map((t: any) => t.id)).toEqual(["t2"]);
    });
});
