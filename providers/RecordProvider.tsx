import {
    ExpoAudioStreamModule,
    useAudioRecorder,
    type AudioDataEvent,
    type AudioRecording,
} from "@siteed/expo-audio-studio";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { createSpeechRecordingConfig } from "@/lib/audioRecorder";
import { ChunkBufferManager } from "@/services/recordings/chunkBufferManager";
import { chunkUploadQueue } from "@/services/recordings/chunkUploadQueue";
import { discardIncompleteSession } from "@/services/recordings/sessionRecovery";
import { uploadAudioBase64 } from "@/services/recordings/uploadAudioBase64";
import { guessExtension } from "@/types/fileHelpers";
import type { ChunkUploadProgress } from "@/types/chunkTypes";
import type { SexKey } from "@/types/uploadTypes";

// ── Types ─────────────────────────────────────────────────

export type StartSessionMeta = {
    userId: string;
    patientName: string;
    guardianName: string;
    sex: SexKey;
};

type RecorderCtxValue = {
    start: (meta: StartSessionMeta) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    finish: () => Promise<string | null>;
    discard: () => Promise<void>;

    isRecording: boolean;
    isPaused: boolean;

    durationMs: number;
    lastResult: AudioRecording | null;
    chunkProgress: ChunkUploadProgress | null;
};

// ── Context ───────────────────────────────────────────────

const RecorderCtx = createContext<RecorderCtxValue | null>(null);

function generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    return `${timestamp}_${random}`;
}

// ── Provider ──────────────────────────────────────────────

export function RecorderProvider({ children }: { children: React.ReactNode }) {
    const [lastResult, setLastResult] = useState<AudioRecording | null>(null);
    const [chunkProgress, setChunkProgress] = useState<ChunkUploadProgress | null>(null);

    const chunkBufferRef = useRef<ChunkBufferManager | null>(null);
    const sessionIdRef = useRef<string | null>(null);
    const sessionMetaRef = useRef<StartSessionMeta | null>(null);

    const {
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        isRecording,
        isPaused,
        durationMs,
    } = useAudioRecorder();

    // Subscribe to chunk upload progress
    useEffect(() => {
        const unsub = chunkUploadQueue.onProgress(setChunkProgress);
        return unsub;
    }, []);

    // ── start ─────────────────────────────────────────────

    const start = useCallback(
        async (meta: StartSessionMeta) => {
            if (isRecording && !isPaused) return;

            const perm = await ExpoAudioStreamModule.requestPermissionsAsync();
            if (perm.status !== "granted") {
                throw new Error("Permissão de microfone negada");
            }

            setLastResult(null);
            setChunkProgress(null);

            // Generate session ID and store metadata
            const sessionId = generateSessionId();
            sessionIdRef.current = sessionId;
            sessionMetaRef.current = meta;

            // Initialize chunk upload queue session
            await chunkUploadQueue.initSession({
                userId: meta.userId,
                sessionId,
                patientName: meta.patientName,
                guardianName: meta.guardianName,
                sex: meta.sex,
            });

            // Create chunk buffer manager
            chunkBufferRef.current = new ChunkBufferManager({
                flushIntervalChunks: 30, // 30 events = 30 seconds at interval:1000
                onFlush: (data) => {
                    chunkUploadQueue.enqueue(data);
                },
            });
            await chunkBufferRef.current.start();

            // Create recording config with onAudioStream wired to chunk buffer
            const config = createSpeechRecordingConfig({
                onAudioStream: async (event: AudioDataEvent) => {
                    if (event.data && typeof event.data === "string") {
                        chunkBufferRef.current?.push({
                            audioData: event.data,
                            position: event.position,
                            eventDataSize: event.eventDataSize,
                        });
                    }
                },
            });

            await startRecording(config);
            console.log(`[RecordProvider] Recording started, session: ${sessionId}`);
        },
        [isRecording, isPaused, startRecording]
    );

    // ── pause / resume ────────────────────────────────────

    const pause = useCallback(async () => {
        if (!isRecording) return;
        await pauseRecording();
    }, [isRecording, pauseRecording]);

    const resume = useCallback(async () => {
        if (!isPaused) return;
        await resumeRecording();
    }, [isPaused, resumeRecording]);

    // ── finish ────────────────────────────────────────────

    const finish = useCallback(async () => {
        console.log("[RecordProvider] finish() called");

        // 1. Flush remaining buffer as final chunk
        chunkBufferRef.current?.flushRemaining();
        chunkBufferRef.current?.stop();

        // 2. Stop the recording (gets full file)
        const result = await stopRecording();
        setLastResult(result ?? null);

        console.log("[RecordProvider] stopRecording result:", JSON.stringify({
            fileUri: result?.fileUri,
            durationMs: result?.durationMs,
            size: result?.size,
            mimeType: result?.mimeType,
            compression: result?.compression
                ? {
                    compressedFileUri: result.compression.compressedFileUri,
                    size: result.compression.size,
                    format: result.compression.format,
                }
                : null,
        }));

        const uri =
            result?.compression?.compressedFileUri ??
            result?.fileUri ??
            null;

        console.log("[RecordProvider] extracted uri:", uri);

        // 3. Upload full file as backup (non-blocking if it fails)
        const session = chunkUploadQueue.getSession();
        let fullFileStoragePath: string | undefined;

        if (uri && session) {
            try {
                const ext = guessExtension(uri);
                fullFileStoragePath = `${session.storagePrefix}/full_recording.${ext}`;

                await uploadAudioBase64({
                    fileUri: uri,
                    bucket: session.bucket,
                    storagePath: fullFileStoragePath,
                    upsert: false,
                });

                console.log("[RecordProvider] Full file backup uploaded:", fullFileStoragePath);
            } catch (err) {
                console.warn("[RecordProvider] Full file backup upload failed:", err);
                fullFileStoragePath = undefined;
            }
        }

        // 4. Wait for chunk queue to drain and finalize session
        try {
            await chunkUploadQueue.finalize({
                durationMs: result?.durationMs ?? durationMs ?? 0,
                fullFileStoragePath,
            });

            console.log("[RecordProvider] Chunk session finalized");
        } catch (err) {
            console.warn("[RecordProvider] Chunk finalization error:", err);
        }

        // 5. Clean up
        await chunkUploadQueue.clearSession();
        await chunkBufferRef.current?.reset();
        sessionIdRef.current = null;
        sessionMetaRef.current = null;

        return uri;
    }, [stopRecording, durationMs]);

    // ── discard ───────────────────────────────────────────

    const discard = useCallback(async () => {
        // Stop buffer
        chunkBufferRef.current?.stop();
        await chunkBufferRef.current?.reset();

        // Stop recording
        const result = await stopRecording();
        setLastResult(null);

        // Delete uploaded chunks from storage
        const persistedSession = await chunkUploadQueue.loadPersistedSession();
        if (persistedSession) {
            try {
                await discardIncompleteSession(persistedSession);
            } catch (err) {
                console.warn("[RecordProvider] Failed to discard chunks:", err);
            }
        }
        await chunkUploadQueue.clearSession();

        // Delete local file
        const uri =
            result?.compression?.compressedFileUri ??
            result?.fileUri ??
            null;

        try {
            const maybeDelete = (ExpoAudioStreamModule as any).deleteFileAsync;
            if (uri && typeof maybeDelete === "function") {
                await maybeDelete(uri);
            }
        } catch {}

        sessionIdRef.current = null;
        sessionMetaRef.current = null;
    }, [stopRecording]);

    // ── Context value ─────────────────────────────────────

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
            chunkProgress,
        }),
        [start, pause, resume, finish, discard, isRecording, isPaused, durationMs, lastResult, chunkProgress]
    );

    return <RecorderCtx.Provider value={value}>{children}</RecorderCtx.Provider>;
}

export function useRecorder() {
    const ctx = useContext(RecorderCtx);
    if (!ctx) throw new Error("useRecorder must be used inside RecorderProvider");
    return ctx;
}
