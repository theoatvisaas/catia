import React, { createContext, useContext, useEffect, useState } from "react";
import { useConsultationStore } from "@/stores/consultation/useConsultationStore";
import { runStartupRecovery, type StartupRecoveryResult } from "@/services/recordings/startupRecovery";

type ConsultationCtxValue = {
    /** True while startup recovery is running */
    recoveryRunning: boolean;
    /** True if there are crashed sessions that were recovered */
    recoveryNeeded: boolean;
    /** Session IDs that had temp buffers recovered */
    crashedSessions: string[];
    /** Dismiss the recovery banner */
    dismissRecovery: () => void;
};

const ConsultationCtx = createContext<ConsultationCtxValue>({
    recoveryRunning: false,
    recoveryNeeded: false,
    crashedSessions: [],
    dismissRecovery: () => {},
});

export function ConsultationProvider({ children }: { children: React.ReactNode }) {
    const [recoveryRunning, setRecoveryRunning] = useState(true);
    const [crashedSessions, setCrashedSessions] = useState<string[]>([]);
    const [dismissed, setDismissed] = useState(false);

    const hydrated = useConsultationStore((s) => s.hydrated);

    useEffect(() => {
        if (!hydrated) return;

        let cancelled = false;

        runStartupRecovery()
            .then((result) => {
                if (cancelled) return;
                setCrashedSessions(result.recoveredSessions);
            })
            .catch((err) => {
                console.warn("[ConsultationProvider] Recovery error:", err);
            })
            .finally(() => {
                if (!cancelled) setRecoveryRunning(false);
            });

        return () => {
            cancelled = true;
        };
    }, [hydrated]);

    const recoveryNeeded = !dismissed && crashedSessions.length > 0;

    const dismissRecovery = () => setDismissed(true);

    return (
        <ConsultationCtx.Provider
            value={{
                recoveryRunning,
                recoveryNeeded,
                crashedSessions,
                dismissRecovery,
            }}
        >
            {children}
        </ConsultationCtx.Provider>
    );
}

export function useConsultationRecovery() {
    return useContext(ConsultationCtx);
}
