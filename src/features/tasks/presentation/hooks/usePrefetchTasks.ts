"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTasks, clearTasks } from "@/features/tasks/presentation/store/tasksSlice";
import { selectTasksState } from "@/features/tasks/presentation/store/tasksSelectors";

export function usePrefetchTasks() {
    const dispatch = useAppDispatch();
    const uid = useAppSelector((s) => s.auth.uid);
    const { uid: tasksUid, hydrated } = useAppSelector(selectTasksState);

    React.useEffect(() => {
        if (!uid) {
            dispatch(clearTasks());
            return;
        }

        if (tasksUid !== uid || !hydrated) {
            void dispatch(fetchTasks({ uid }));
        }
    }, [uid, tasksUid, hydrated, dispatch]);
}
