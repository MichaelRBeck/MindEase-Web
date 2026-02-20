"use client";

// Banner simples para alertas cognitivos (ex: lembrar de pausar)
export function CognitiveAlertBanner(props: {
    visible: boolean;
    message: string;
    onDismiss: () => void;
    onSnooze: () => void;
}) {
    // Se não estiver visível, não renderiza nada
    if (!props.visible) return null;

    return (
        <section
            data-testid="cognitive-alert-banner"
            role="status"
            aria-live="polite"
            className="fixed left-4 right-4 bottom-24 md:bottom-6 z-[60] bg-[#FFF8E1] border border-[#FFBF00]/30 rounded-3xl p-4 md:p-5 shadow-sm"
        >
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                <p className="text-sm md:text-base text-[#2C3E50] leading-relaxed">
                    💡 {props.message}
                </p>

                <div className="flex gap-3 md:ml-auto">
                    {/* Adia o alerta por alguns minutos */}
                    <button
                        type="button"
                        data-testid="cognitive-alert-snooze"
                        onClick={props.onSnooze}
                        className="btn-secondary"
                    >
                        Snooze 5 min
                    </button>

                    {/* Fecha o alerta manualmente */}
                    <button
                        type="button"
                        data-testid="cognitive-alert-dismiss"
                        onClick={props.onDismiss}
                        className="btn-ghost"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </section>
    );
}
