"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTasks, clearTasks } from "@/features/tasks/presentation/store/tasksSlice";
import { selectTasksState } from "@/features/tasks/presentation/store/tasksSelectors";

// Hook que garante que as tasks estejam carregadas no Redux
export function usePrefetchTasks() {
    const dispatch = useAppDispatch();

    // UID atual vindo do slice de auth
    const uid = useAppSelector((s) => s.auth.uid);

    // Estado atual das tasks no store
    const { uid: tasksUid, hydrated } = useAppSelector(selectTasksState);

    React.useEffect(() => {
        // Se não tem usuário, limpa as tasks
        if (!uid) {
            dispatch(clearTasks());
            return;
        }

        // Se o usuário mudou ou ainda não hidratou, busca do backend
        if (tasksUid !== uid || !hydrated) {
            void dispatch(fetchTasks({ uid }));
        }
    }, [uid, tasksUid, hydrated, dispatch]);
}
