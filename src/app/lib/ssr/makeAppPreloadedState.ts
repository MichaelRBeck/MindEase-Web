import "server-only";
import type { RootState } from "@/store/makeStore";
import { adminListTasks } from "@/features/tasks/data/adminListTasks";
import { adminGetUserProfile } from "@/features/profile/data/adminGetUserProfile";
import { adminGetCognitivePreferences } from "@/features/cognitive/data/adminGetCognitivePreferences";
import { DEFAULT_COGNITIVE_PREFS } from "@/features/cognitive/domain/preferences";
import { DEFAULT_USER_PROFILE } from "@/features/profile/domain/userProfile";

// Função que transforma “needs” do perfil em ajustes automáticos no painel cognitivo
import { needsToCognitiveOverrides } from "@/features/cognitive/presentation/CognitiveProvider";

// Monta o estado inicial da aplicação já com dados do usuário autenticado (SSR)
export async function makeAppPreloadedState(uid: string): Promise<RootState> {
    // Busca tudo em paralelo para reduzir tempo de resposta
    const [tasks, profile, cognitive] = await Promise.all([
        adminListTasks(uid),
        adminGetUserProfile(uid),
        adminGetCognitivePreferences(uid),
    ]);

    // Converte necessidades do perfil em ajustes cognitivos automáticos
    const overrides = needsToCognitiveOverrides(profile);

    // Merge final: default + salvo no banco + overrides do perfil
    const mergedCognitive = {
        ...DEFAULT_COGNITIVE_PREFS,
        ...cognitive,
        ...overrides,
    };

    return {
        auth: { uid, status: "authenticated" },

        // Tasks já vêm hidratadas do servidor
        tasks: {
            uid,
            items: tasks,
            loading: false,
            error: null,
            hydrated: true,
        },

    } as RootState;
}
