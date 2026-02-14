"use client";

import * as React from "react";
import { KanbanBoard } from "@/features/tasks/presentation/components/KanbanBoard";

export function TasksPage() {
    return (
        <main data-testid="tasks-container" className="min-h-screen bg-[#F4F4F9]">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <header>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50] mb-2">Organizador de Tarefas</h1>
                    <p className="text-lg text-[#546E7A]">Crie, edite, mova e conclua tarefas no seu ritmo</p>
                </header>

                <KanbanBoard />
            </div>
        </main>
    );
}
