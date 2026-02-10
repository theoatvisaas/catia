import {
    ExpoAudioStreamModule,
    useAudioRecorder,
    type AudioRecording,
} from "@siteed/expo-audio-studio";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import { createSpeechRecordingConfig } from "@/lib/audioRecorder";

type RecorderCtxValue = {
    // compat com seu código atual
    start: () => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    finish: () => Promise<string | null>;
    discard: () => Promise<void>;

    isRecording: boolean;
    isPaused: boolean;

    durationMs: number;
    lastResult: AudioRecording | null;
};

const RecorderCtx = createContext<RecorderCtxValue | null>(null);

export function RecorderProvider({ children }: { children: React.ReactNode }) {
    const [lastResult, setLastResult] = useState<AudioRecording | null>(null);

    const {
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        isRecording,
        isPaused,
        durationMs,
    } = useAudioRecorder();

    const start = useCallback(async () => {
        // evita bug/duplicação
        if (isRecording && !isPaused) return;

        const perm = await ExpoAudioStreamModule.requestPermissionsAsync();
        if (perm.status !== "granted") {
            throw new Error("Permissão de microfone negada");
        }

        setLastResult(null);

        const config = createSpeechRecordingConfig();
        await startRecording(config);
    }, [isRecording, isPaused, startRecording]);

    const pause = useCallback(async () => {
        if (!isRecording) return;
        await pauseRecording();
    }, [isRecording, pauseRecording]);

    const resume = useCallback(async () => {
        if (!isPaused) return;
        await resumeRecording();
    }, [isPaused, resumeRecording]);

    const finish = useCallback(async () => {
        const result = await stopRecording();
        setLastResult(result ?? null);

        const uri =
            result?.compression?.compressedFileUri ??
            (result as any)?.compressedFileUri ??
            (result as any)?.fileUri ??
            null;

        return uri;
    }, [stopRecording]);

    const discard = useCallback(async () => {
        const result = await stopRecording();
        setLastResult(null);

        const uri =
            result?.compression?.compressedFileUri ??
            (result as any)?.compressedFileUri ??
            (result as any)?.fileUri ??
            null;

        try {
            const maybeDelete = (ExpoAudioStreamModule as any).deleteFileAsync;
            if (uri && typeof maybeDelete === "function") {
                await maybeDelete(uri);
            }
        } catch { }
    }, [stopRecording]);

    const value: RecorderCtxValue = useMemo(
        () => ({
            start,
            pause,
            resume,
            finish,
            discard,
            isRecording,
            isPaused,
            durationMs: durationMs ?? 0,
            lastResult,
        }),
        [start, pause, resume, finish, discard, isRecording, isPaused, durationMs, lastResult]
    );

    return <RecorderCtx.Provider value={value}>{children}</RecorderCtx.Provider>;
}

export function useRecorder() {
    const ctx = useContext(RecorderCtx);
    if (!ctx) throw new Error("useRecorder must be used inside RecorderProvider");
    return ctx;
}
