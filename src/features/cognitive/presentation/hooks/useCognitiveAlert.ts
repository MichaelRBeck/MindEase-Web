"use client";

import * as React from "react";
import { useCognitive } from "@/features/cognitive/presentation/CognitiveProvider";

type UseCognitiveAlertOptions = {
    // Identifica o contexto (tipo: "tasks", "timer", "dashboard")
    key: string;
    // Texto do alerta (curto e direto)
    message: string;
    // Quantos minutos para adiar (default: 5)
    snoozeMinutes?: number;
};

type UseCognitiveAlertResult = {
    visible: boolean;
    message: string;
    dismiss: () => void;
    snooze: () => void;
};

function nowMs() {
    return Date.now();
}

export function useCognitiveAlert(options: UseCognitiveAlertOptions): UseCognitiveAlertResult {
    const { key, message, snoozeMinutes = 5 } = options;
    const cognitive = useCognitive();

    // Lê as preferências já aplicadas no app
    const enabled = !!cognitive.applied.cognitiveAlertsEnabled;
    const thresholdMin =
        typeof cognitive.applied.alertThresholdMinutes === "number" ? cognitive.applied.alertThresholdMinutes : 5;

    const [visible, setVisible] = React.useState(false);

    // Marca quando a “visita” começou (cada tela pode ter seu timer)
    const startRef = React.useRef<number>(0);

    // Timeout atual do alerta (pra cancelar/reagendar)
    const timeoutRef = React.useRef<number | null>(null);

    // Até quando o snooze vale (timestamp)
    const snoozeUntilRef = React.useRef<number>(0);

    const clear = React.useCallback(() => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const schedule = React.useCallback(() => {
        clear();

        if (!enabled) {
            setVisible(false);
            return;
        }

        const start = startRef.current || nowMs();
        const thresholdMs = thresholdMin * 60_000;

        // Se estiver em snooze, o alerta só volta depois disso
        const snoozeUntil = snoozeUntilRef.current;
        const baseline = Math.max(start + thresholdMs, snoozeUntil);

        const delay = Math.max(0, baseline - nowMs());

        timeoutRef.current = window.setTimeout(() => {
            setVisible(true);
        }, delay);
    }, [clear, enabled, thresholdMin]);

    // Reinicia o timer quando trocar de tela (key) ou mudar config relevante
    React.useEffect(() => {
        startRef.current = nowMs();
        setVisible(false);
        snoozeUntilRef.current = 0;
        schedule();

        return () => clear();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, enabled, thresholdMin]);

    const dismiss = React.useCallback(() => {
        setVisible(false);
        clear();
    }, [clear]);

    const snooze = React.useCallback(() => {
        setVisible(false);
        snoozeUntilRef.current = nowMs() + snoozeMinutes * 60_000;
        schedule();
    }, [schedule, snoozeMinutes]);

    return { visible, message, dismiss, snooze };
}
