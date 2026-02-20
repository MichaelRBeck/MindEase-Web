"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Settings, Clock3, Lightbulb } from "lucide-react";

type OnboardingStep = {
    title: string;
    description: string;
    Icon: React.ComponentType<{ className?: string }>;
    tip: string;
};

const STEPS: readonly OnboardingStep[] = [
    {
        title: "Bem-vindo ao MindEase",
        description: "Um espaço de apoio, pensado especialmente para mentes neurodivergentes.",
        Icon: Sparkles,
        tip: "Vá no seu ritmo. Não tem pressa.",
    },
    {
        title: "Personalize sua experiência",
        description: "Ajuste tamanho da fonte, espaçamento e níveis de complexidade do jeito que for melhor pra você.",
        Icon: Settings,
        tip: "Você pode mudar isso quando quiser nas configurações.",
    },
    {
        title: "Modo foco e timers gentis",
        description: "Use o modo foco para reduzir distrações e timers gentis para te ajudar a manter o ritmo.",
        Icon: Clock3,
        tip: "Se preferir, dá pra reduzir animações para ficar ainda mais calmo.",
    },
] as const;

export function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = React.useState<number>(1);

    const totalSteps = STEPS.length;
    const clampedStep = Math.min(Math.max(step, 1), totalSteps);
    const currentStep = STEPS[clampedStep - 1];

    const titleId = React.useId();
    const descId = React.useId();

    function goNext() {
        setStep((s) => Math.min(s + 1, totalSteps));
    }

    function goBack() {
        setStep((s) => Math.max(s - 1, 1));
    }

    function finish() {
        router.push("/auth");
    }

    const StepIcon = currentStep.Icon;

    return (
        <main
            data-testid="onboarding-container"
            className="min-h-screen bg-[#F4F4F9] flex flex-col items-center justify-center px-6 py-12"
            aria-labelledby={titleId}
            aria-describedby={descId}
        >
            <div className="max-w-2xl w-full mx-auto">
                <section className="card space-y-8">
                    <header className="text-center space-y-6">
                        <div className="flex justify-center">
                            <StepIcon className="w-16 h-16 text-[#005A9C]" aria-hidden="true" />
                        </div>

                        <h1 id={titleId} className="text-3xl md:text-4xl font-bold text-[#2C3E50]">
                            {currentStep.title}
                        </h1>

                        <p
                            id={descId}
                            className="text-lg leading-relaxed text-[#546E7A] max-w-xl mx-auto"
                            aria-live="polite"
                        >
                            {currentStep.description}
                        </p>

                        <div className="bg-[#FFF8E1] border border-[#FFBF00]/30 rounded-2xl p-4">
                            <p className="text-sm text-[#2C3E50] leading-relaxed flex items-start justify-center gap-2">
                                <Lightbulb className="w-4 h-4 mt-0.5" aria-hidden="true" />
                                <span>{currentStep.tip}</span>
                            </p>
                        </div>
                    </header>

                    {/* Progresso do onboarding */}
                    <div
                        className="flex items-center justify-center gap-2"
                        aria-label={`Etapa ${clampedStep} de ${totalSteps}`}
                    >
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((num) => (
                            <div
                                key={num}
                                className={`h-2 rounded-full transition-all duration-300 ${num === clampedStep ? "w-8 bg-[#005A9C]" : "w-2 bg-slate-300"
                                    }`}
                                aria-hidden="true"
                            />
                        ))}
                    </div>

                    {/* Navegação do onboarding */}
                    <div
                        className="flex flex-col sm:flex-row gap-4 justify-between"
                        role="group"
                        aria-label="Navegação do onboarding"
                    >
                        {clampedStep > 1 ? (
                            <button
                                data-testid="onboarding-back-btn"
                                type="button"
                                onClick={goBack}
                                className="btn-ghost"
                            >
                                Voltar
                            </button>
                        ) : (
                            <span aria-hidden="true" />
                        )}

                        {clampedStep < totalSteps ? (
                            <button
                                data-testid="onboarding-next-btn"
                                type="button"
                                onClick={goNext}
                                className="btn-primary ml-auto"
                            >
                                Próximo
                            </button>
                        ) : (
                            <button
                                data-testid="onboarding-finish-btn"
                                type="button"
                                onClick={finish}
                                className="btn-primary ml-auto"
                            >
                                Começar
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
