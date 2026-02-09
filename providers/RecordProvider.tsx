import { AudioRecorder, createAudioRecorder } from "@/lib/audioRecorder";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type RecorderCtxValue = AudioRecorder & {
    isRecording: boolean;
    isPaused: boolean;
};

const RecorderCtx = createContext<RecorderCtxValue | null>(null);

export function RecorderProvider({ children }: { children: React.ReactNode }) {
    const recorder = useMemo(() => createAudioRecorder(), []);

    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const start = useCallback(async () => {
        // se já está gravando, não faz nada (evita bug)
        if (isRecording && !isPaused) return;

        await recorder.start();
        setIsRecording(true);
        setIsPaused(false);
    }, [recorder, isRecording, isPaused]);

    const pause = useCallback(async () => {
        if (!isRecording) return;

        await recorder.pause();
        setIsRecording(false);
        setIsPaused(true);
    }, [recorder, isRecording]);

    const resume = useCallback(async () => {
        if (!isPaused) return;

        await recorder.resume();
        setIsRecording(true);
        setIsPaused(false);
    }, [recorder, isPaused]);

    const finish = useCallback(async () => {
        const uri = await recorder.finish();
        setIsRecording(false);
        setIsPaused(false);
        return uri;
    }, [recorder]);

    const discard = useCallback(async () => {
        await recorder.discard();
        setIsRecording(false);
        setIsPaused(false);
    }, [recorder]);

    const value: RecorderCtxValue = {
        ...recorder,
        start,
        pause,
        resume,
        finish,
        discard,
        isRecording,
        isPaused,
    };

    return <RecorderCtx.Provider value={value}>{children}</RecorderCtx.Provider>;
}

export function useRecorder() {
    const ctx = useContext(RecorderCtx);
    if (!ctx) throw new Error("useRecorder must be used inside RecorderProvider");
    return ctx;
}
