import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Task, TaskStatus } from "@/features/tasks/domain/task";
import { FirebaseTasksRepository } from "@/features/tasks/data/firebaseTasksRepository";

type TasksState = {
    uid: string | null;
    items: Task[];
    loading: boolean;
    error: string | null;
    hydrated: boolean;
};

const initialState: TasksState = {
    uid: null,
    items: [],
    loading: false,
    error: null,
    hydrated: false,
};

// Thunks recebem uid (porque auth está fora do redux por enquanto)
export const fetchTasks = createAsyncThunk<Task[], { uid: string }>(
    "tasks/fetch",
    async ({ uid }) => {
        const repo = new FirebaseTasksRepository(uid);
        return await repo.list();
    }
);

export const createTask = createAsyncThunk<Task, { uid: string; input: Omit<Task, "id" | "createdAt" | "updatedAt"> }>(
    "tasks/create",
    async ({ uid, input }) => {
        const repo = new FirebaseTasksRepository(uid);
        return await repo.create(input);
    }
);

export const updateTask = createAsyncThunk<Task, { uid: string; id: string; patch: Partial<Omit<Task, "id" | "createdAt">> }>(
    "tasks/update",
    async ({ uid, id, patch }) => {
        const repo = new FirebaseTasksRepository(uid);
        return await repo.update(id, patch);
    }
);

export const removeTask = createAsyncThunk<string, { uid: string; id: string }>(
    "tasks/remove",
    async ({ uid, id }) => {
        const repo = new FirebaseTasksRepository(uid);
        await repo.remove(id);
        return id;
    }
);

export const moveTask = createAsyncThunk<Task[], { uid: string; id: string; toStatus: TaskStatus; toIndex: number }>(
    "tasks/move",
    async ({ uid, id, toStatus, toIndex }) => {
        const repo = new FirebaseTasksRepository(uid);
        return await repo.move(id, toStatus, toIndex);
    }
);

const tasksSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        clearTasks(state) {
            state.uid = null;
            state.items = [];
            state.loading = false;
            state.error = null;
            state.hydrated = false;
        },

        hydrateFromServer(state, action: PayloadAction<{ uid: string; items: Task[] }>) {
            state.uid = action.payload.uid;
            state.items = action.payload.items;
            state.loading = false;
            state.error = null;
            state.hydrated = true;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                state.uid = action.meta.arg.uid; // ✅ trava no uid que está carregando
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.hydrated = true;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to load tasks";
                state.hydrated = true;
            })

            // create
            .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
                state.items = [action.payload, ...state.items];
            })

            // update
            .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
                state.items = state.items.map((t) => (t.id === action.payload.id ? action.payload : t));
            })

            // remove
            .addCase(removeTask.fulfilled, (state, action: PayloadAction<string>) => {
                state.items = state.items.filter((t) => t.id !== action.payload);
            })

            // move
            .addCase(moveTask.fulfilled, (state, action: PayloadAction<Task[]>) => {
                state.items = action.payload;
            });
    },
});

export const { clearTasks, hydrateFromServer } = tasksSlice.actions;
export default tasksSlice.reducer;
