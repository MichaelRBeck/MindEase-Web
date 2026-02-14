"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type OnboardingStep = {
    title: string;
    description: string;
    image: string;
    tip: string;
};

const STEPS: readonly OnboardingStep[] = [
    {
        title: "Welcome to MindEase",
        description: "A supportive space designed specifically for neurodivergent minds.",
        image: "🌸",
        tip: "Take your time exploring. There's no rush.",
    },
    {
        title: "Customize Your Experience",
        description: "Adjust font size, spacing, and complexity levels to match your needs.",
        image: "⚙️",
        tip: "You can change these settings anytime in your profile.",
    },
    {
        title: "Focus Mode & Gentle Timers",
        description: "Use focus mode to reduce distractions and gentle timers to pace yourself.",
        image: "🕐",
        tip: "All animations can be turned off for a calmer experience.",
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
                        <div className="text-7xl" aria-hidden="true">
                            {currentStep.image}
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
                            <p className="text-sm text-[#2C3E50] leading-relaxed">
                                <span aria-hidden="true">💡 </span>
                                {currentStep.tip}
                            </p>
                        </div>
                    </header>

                    {/* Progress */}
                    <div className="flex items-center justify-center gap-2" aria-label={`Step ${clampedStep} of ${totalSteps}`}>
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((num) => (
                            <div
                                key={num}
                                className={`h-2 rounded-full transition-all duration-300 ${num === clampedStep ? "w-8 bg-[#005A9C]" : "w-2 bg-slate-300"
                                    }`}
                                aria-hidden="true"
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between" role="group" aria-label="Onboarding navigation">
                        {clampedStep > 1 ? (
                            <button
                                data-testid="onboarding-back-btn"
                                type="button"
                                onClick={goBack}
                                className="btn-ghost"
                            >
                                Back
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
                                Next
                            </button>
                        ) : (
                            <button
                                data-testid="onboarding-finish-btn"
                                type="button"
                                onClick={finish}
                                className="btn-primary ml-auto"
                            >
                                Get Started
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
