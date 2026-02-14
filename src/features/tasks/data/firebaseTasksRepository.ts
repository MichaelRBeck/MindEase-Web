import type { TasksRepository } from "@/features/tasks/domain/tasksRepository";
import type { Task, TaskStatus } from "@/features/tasks/domain/task";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
} from "firebase/firestore";
import { firestore } from "@/app/lib/firebase/client";

type CreateTaskInput = Omit<Task, "createdAt" | "updatedAt" | "id">;
type UpdateTaskPatch = Partial<Omit<Task, "createdAt" | "id">>;

type FirestoreTaskDTO = Task & {
    createdAt: number;
    updatedAt: number;
};

export class FirebaseTasksRepository implements TasksRepository {
    constructor(private readonly uid: string) { }

    private colRef() {
        return collection(firestore, "users", this.uid, "tasks");
    }

    private docRef(id: string) {
        return doc(this.colRef(), id);
    }

    async list(): Promise<Task[]> {
        // ordena por createdAt (se seu app usa outro critério, troca aqui)
        const q = query(this.colRef(), orderBy("createdAt", "asc"));
        const snap = await getDocs(q);
        return snap.docs.map((d) => d.data() as Task);
    }

    async create(input: CreateTaskInput): Promise<Task> {
        const now = Date.now();

        // cria sem id
        const payload: Omit<FirestoreTaskDTO, "id"> = {
            ...(input as Omit<Task, "id" | "createdAt" | "updatedAt">),
            createdAt: now,
            updatedAt: now,
        };

        const created = await addDoc(this.colRef(), payload);

        const task: Task = {
            ...(payload as unknown as Task),
            id: created.id,
            createdAt: now,
            updatedAt: now,
        };

        // garante o id dentro do doc (se seu domínio depende disso)
        await updateDoc(this.docRef(created.id), { id: created.id });

        return task;
    }

    async update(id: string, patch: UpdateTaskPatch): Promise<Task> {
        const ref = this.docRef(id);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error("Task não encontrada");

        const prev = snap.data() as Task;
        const next: Task = {
            ...prev,
            ...(patch as Partial<Task>),
            id: prev.id,
            createdAt: prev.createdAt,
            updatedAt: Date.now(),
        };

        await setDoc(ref, next, { merge: true });
        return next;
    }

    async move(id: string, toStatus: TaskStatus, toIndex: number): Promise<Task[]> {
        await this.update(id, { status: toStatus, order: toIndex } as any);
        return this.list();
    }



    // Se seu TasksRepository tiver delete/remove, mantém compatível:
    async remove(id: string): Promise<void> {
        await deleteDoc(this.docRef(id));
    }
}
