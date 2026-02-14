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

import * as Crypto from "expo-crypto";
import { createSpeechRecordingConfig } from "@/lib/audioRecorder";
import { ChunkBufferManager } from "@/services/recordings/chunkBufferManager";
import { chunkUploadQueue } from "@/services/recordings/chunkUploadQueue";
import { StreamWatchdog } from "@/services/recordings/streamWatchdog";
import { finalizeConsultation, discardConsultation } from "@/services/recordings/consultationSyncService";
import { requestNotificationPermission, notifyStreamDead, notifyDiskFull } from "@/services/notifications/notificationService";
import { ts } from "@/lib/logger";
import { useConsultationStore } from "@/stores/consultation/useConsultationStore";
import type { SyncProgress } from "@/types/consultationTypes";
import type { SexKey } from "@/types/uploadTypes";

const TAG = "[RecordProvider]";

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
    resetStreamDead: () => void;
    resetDiskFull: () => void;

    isRecording: boolean;
    isPaused: boolean;

    durationMs: number;
    lastResult: AudioRecording | null;
    chunkProgress: SyncProgress | null;

    activeSessionId: string | null;
    streamDead: boolean;
    diskFull: boolean;
};

// ── Context ───────────────────────────────────────────────

const RecorderCtx = createContext<RecorderCtxValue | null>(null);

function generateSessionId(): string {
    return Crypto.randomUUID();
}

const BUCKET = process.env.EXPO_PUBLIC_SUPABASE_BUCKET || "recordings";

// ── Provider ──────────────────────────────────────────────

export function RecorderProvider({ children }: { children: React.ReactNode }) {
    const [lastResult, setLastResult] = useState<AudioRecording | null>(null);
    const [chunkProgress, setChunkProgress] = useState<SyncProgress | null>(null);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [streamDead, setStreamDead] = useState(false);
    const [diskFull, setDiskFull] = useState(false);

    const chunkBufferRef = useRef<ChunkBufferManager | null>(null);
    const watchdogRef = useRef<StreamWatchdog | null>(null);
    const sessionMetaRef = useRef<StartSessionMeta | null>(null);
    const audioEventCountRef = useRef(0);

    const store = useConsultationStore;

    const {
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        isRecording,
        isPaused,
        durationMs,
    } = useAudioRecorder();

    // Ref to avoid stale closure in watchdog onDead callback
    const pauseRecordingRef = useRef(pauseRecording);
    pauseRecordingRef.current = pauseRecording;

    // Subscribe to chunk upload progress
    useEffect(() => {
        const unsub = chunkUploadQueue.onProgress((progress) => {
            if (!activeSessionId) return;
            setChunkProgress({
                sessionId: activeSessionId,
                totalChunks: progress.totalChunks,
                uploadedChunks: progress.uploadedChunks,
                failedChunks: progress.failedChunks,
                pendingLocalChunks: progress.totalChunks - progress.uploadedChunks - progress.failedChunks,
                currentlyUploading: progress.currentlyUploading,
                percent: progress.totalChunks > 0
                    ? Math.round((progress.uploadedChunks / progress.totalChunks) * 100)
                    : 0,
            });
        });
        return unsub;
    }, [activeSessionId]);

    // ── start ─────────────────────────────────────────────

    const start = useCallback(
        async (meta: StartSessionMeta) => {
            console.log(
                `${ts(TAG)} start() | patient=${meta.patientName} | guardian=${meta.guardianName} | sex=${meta.sex} | userId=${meta.userId}`
            );

            if (isRecording && !isPaused) {
                console.warn(`${ts(TAG)} start() | ABORTED — already recording (isRecording=${isRecording}, isPaused=${isPaused})`);
                return;
            }

            // Guard: check for active recording in store
            console.log(`${ts(TAG)} start() | Checking for active recording in store...`);
            const hasActive = store.getState().hasActiveRecording();
            if (hasActive) {
                const active = store.getState().getActiveRecording();
                if (active) {
                    console.warn(
                        `${ts(TAG)} start() | ⚠️ Active recording exists: ${active.sessionId} (${active.chunks.length} chunks). Auto-finalizing.`
                    );
                    store.getState().updateConsultation(active.sessionId, {
                        userFinalized: true,
                        finishedAt: Date.now(),
                    });
                    store.getState().recomputeSyncStatus(active.sessionId);
                }
            }

            // Request mic permission
            console.log(`${ts(TAG)} start() | Requesting microphone permission...`);
            const perm = await ExpoAudioStreamModule.requestPermissionsAsync();
            console.log(`${ts(TAG)} start() | Permission status: ${perm.status}`);

            // [TEST] Scenario 1: Simulate denied mic permission
            if (__DEV__) {
                const { testFlags } = require("@/config/testFlags");
                if (testFlags.denyMicPermission) {
                    console.log(`[TEST] Simulated: Microphone permission DENIED`);
                    (perm as any).status = "denied";
                }
            }

            if (perm.status !== "granted") {
                console.error(`${ts(TAG)} start() | ❌ Microphone permission DENIED`);
                throw new Error("Permissao de microfone negada");
            }

            // Request notification permission (after mic granted)
            console.log(`${ts(TAG)} start() | Requesting notification permission...`);
            let notifGranted = await requestNotificationPermission();

            // [TEST] Simulate denied notification permission
            if (__DEV__) {
                const { testFlags } = require("@/config/testFlags");
                if (testFlags.denyNotificationPermission) {
                    console.log(`[TEST] Simulated: Notification permission DENIED`);
                    notifGranted = false;
                }
            }

            if (!notifGranted) {
                console.error(`${ts(TAG)} start() | ❌ Notification permission DENIED`);
                throw new Error("Permissao de notificacao negada");
            }

            setLastResult(null);
            setChunkProgress(null);
            setStreamDead(false);
            setDiskFull(false);
            audioEventCountRef.current = 0;

            // Generate session ID
            const sessionId = generateSessionId();
            setActiveSessionId(sessionId);
            sessionMetaRef.current = meta;
            console.log(`${ts(TAG)} start() | Generated sessionId: ${sessionId}`);

            // Create consultation in store
            console.log(`${ts(TAG)} start() | Creating consultation in store...`);
            store.getState().createConsultation({
                sessionId,
                userId: meta.userId,
                patientName: meta.patientName,
                guardianName: meta.guardianName,
                sex: meta.sex,
                bucket: BUCKET,
            });

            // Initialize chunk upload queue
            console.log(`${ts(TAG)} start() | Initializing upload queue for session ${sessionId}`);
            chunkUploadQueue.setSession(sessionId);

            // Create stream watchdog
            console.log(`${ts(TAG)} start() | Creating stream watchdog (5s timeout)`);
            const watchdog = new StreamWatchdog({
                onDead: () => {
                    console.warn(`${ts(TAG)} ⚠️ STREAM DEAD — watchdog detected no audio for 5s`);
                    setStreamDead(true);
                    notifyStreamDead();
                    // Auto-pause to stop the timer and signal to the user
                    pauseRecordingRef.current().catch(() => {});
                },
            });
            watchdogRef.current = watchdog;
            watchdog.start();

            // Create chunk buffer manager
            console.log(`${ts(TAG)} start() | Creating chunk buffer manager (flush every 30 events)`);
            const buffer = new ChunkBufferManager({
                sessionId,
                flushIntervalChunks: 30,
                onFlush: (data) => {
                    // Add chunk to store as pending_local
                    const consultation = store.getState().getConsultation(sessionId);
                    const order = consultation?.chunks.length ?? 0;
                    const storagePath = `${meta.userId}/recordings/${sessionId}/chunk_${String(data.chunkIndex).padStart(4, "0")}.wav`;

                    const totalBase64Len = data.base64Chunks.reduce((sum, s) => sum + s.length, 0);
                    const estimatedSize = Math.ceil((totalBase64Len * 3) / 4);

                    console.log(
                        `${ts(TAG)} onFlush() | chunk=#${data.chunkIndex} order=${order} | ${data.base64Chunks.length} items | ~${estimatedSize}B | storagePath=${storagePath}`
                    );

                    store.getState().addChunk(sessionId, {
                        index: data.chunkIndex,
                        order,
                        storagePath,
                        status: "pending_local",
                        sizeBytes: estimatedSize,
                        retryCount: 0,
                        streamPosition: data.streamPositionStart,
                    });

                    // Enqueue for upload
                    console.log(`${ts(TAG)} onFlush() | Enqueuing chunk #${data.chunkIndex} for upload`);
                    chunkUploadQueue.enqueue({
                        base64Chunks: data.base64Chunks,
                        chunkIndex: data.chunkIndex,
                        order,
                        streamPositionStart: data.streamPositionStart,
                    });
                },
                onDiskFull: () => {
                    console.warn(`${ts(TAG)} ⚠️ DISK FULL — disk space low callback triggered`);
                    setDiskFull(true);
                    notifyDiskFull();
                    // Stop watchdog BEFORE pausing to prevent false "stream dead" alert
                    watchdogRef.current?.stop();
                    pauseRecordingRef.current().catch(() => {});
                },
                onPersistError: (error) => {
                    console.warn(`${ts(TAG)} ⚠️ Buffer persist error: ${error.message}`);
                    // Disk write failure is as critical as disk full — data at risk on crash.
                    // Trigger the same flow: pause + notify + Alert.
                    setDiskFull(true);
                    notifyDiskFull();
                    // Stop watchdog BEFORE pausing to prevent false "stream dead" alert
                    watchdogRef.current?.stop();
                    pauseRecordingRef.current().catch(() => {});
                },
            });
            chunkBufferRef.current = buffer;

            console.log(`${ts(TAG)} start() | Starting buffer manager...`);
            await buffer.start();
            console.log(`${ts(TAG)} start() | Buffer manager started`);

            // Mark consultation as having a temp buffer
            store.getState().updateConsultation(sessionId, { hasTempBuffer: true });

            // Create recording config
            console.log(`${ts(TAG)} start() | Creating audio recording config (PCM 16-bit, 16kHz, mono)`);
            const config = createSpeechRecordingConfig({
                onAudioStream: async (event: AudioDataEvent) => {
                    if (event.data && typeof event.data === "string") {
                        audioEventCountRef.current++;
                        const count = audioEventCountRef.current;

                        // Log every 10th event to avoid spam, but always log first 3
                        if (count <= 3 || count % 10 === 0) {
                            const b64Len = event.data.length;
                            const approxBytes = Math.ceil((b64Len * 3) / 4);
                            console.log(
                                `${ts(TAG)} onAudioStream #${count} | pos=${event.position} | dataSize=${event.eventDataSize} | b64len=${b64Len} (~${approxBytes}B PCM)`
                            );
                        }

                        // [TEST] Scenarios 2 & 13: Kill audio stream
                        // First 4 events go through normally (to accumulate some data),
                        // then all events are silently dropped — no heartbeat, no buffer push.
                        // Watchdog fires after 5s of no heartbeats, sets streamDead=true.
                        if (__DEV__) {
                            const { testFlags } = require("@/config/testFlags");
                            if (testFlags.killAudioStream && count > 10) {
                                if (count === 11) {
                                    console.log(`[TEST] Audio stream KILLED at event #${count} — dropping all further events, watchdog will fire in 5s`);
                                }
                                // Drop entirely: no heartbeat, no buffer push
                                return;
                            }
                        }

                        watchdog.heartbeat();
                        buffer.push({
                            audioData: event.data,
                            position: event.position,
                            eventDataSize: event.eventDataSize,
                        });
                    }
                },
            });

            console.log(`${ts(TAG)} start() | Calling startRecording()...`);
            await startRecording(config);
            console.log(`${ts(TAG)} start() | ✅ RECORDING STARTED | session=${sessionId} | bucket=${BUCKET}`);
        },
        [isRecording, isPaused, startRecording]
    );

    // ── pause / resume ────────────────────────────────────

    const pause = useCallback(async () => {
        console.log(`${ts(TAG)} pause() | isRecording=${isRecording}`);
        if (!isRecording) {
            console.log(`${ts(TAG)} pause() | Not recording, ignoring`);
            return;
        }
        // Stop watchdog while paused — no audio events expected
        watchdogRef.current?.stop();
        console.log(`${ts(TAG)} pause() | Watchdog stopped (paused)`);
        await pauseRecording();
        console.log(`${ts(TAG)} pause() | ✅ Recording paused`);
    }, [isRecording, pauseRecording]);

    const resume = useCallback(async () => {
        console.log(`${ts(TAG)} resume() | isPaused=${isPaused}`);
        if (!isPaused) {
            console.log(`${ts(TAG)} resume() | Not paused, ignoring`);
            return;
        }
        await resumeRecording();
        // Restart watchdog — audio events should resume
        watchdogRef.current?.start();
        console.log(`${ts(TAG)} resume() | Watchdog restarted`);
        console.log(`${ts(TAG)} resume() | ✅ Recording resumed`);
    }, [isPaused, resumeRecording]);

    const resetStreamDead = useCallback(() => setStreamDead(false), []);
    const resetDiskFull = useCallback(() => setDiskFull(false), []);

    // ── finish ────────────────────────────────────────────

    const finish = useCallback(async () => {
        const sessionId = activeSessionId;
        console.log(`${ts(TAG)} finish() | START | session=${sessionId} | audioEvents=${audioEventCountRef.current} | isRecording=${isRecording} | isPaused=${isPaused}`);

        // 1. Stop watchdog
        console.log(`${ts(TAG)} finish() | Step 1: Stopping watchdog | watchdogExists=${!!watchdogRef.current}`);
        watchdogRef.current?.stop();
        watchdogRef.current = null;

        // 2. Flush remaining buffer BEFORE stopping recording.
        const bufferExists = !!chunkBufferRef.current;
        console.log(`${ts(TAG)} finish() | Step 2: Flushing remaining buffer | bufferExists=${bufferExists}`);
        const flushT0 = Date.now();
        await chunkBufferRef.current?.flushRemaining();
        chunkBufferRef.current?.stop();
        console.log(`${ts(TAG)} finish() | Step 2 DONE: flush+stop took ${Date.now() - flushT0}ms | queueSessionId=${chunkUploadQueue.getSessionId()} | queueHalted=${chunkUploadQueue.isHalted()}`);

        // 3. Stop the recording
        console.log(`${ts(TAG)} finish() | Step 3: Calling stopRecording()... | isRecording=${isRecording} | isPaused=${isPaused}`);
        const stopT0 = Date.now();
        const result = await stopRecording();
        const stopElapsed = Date.now() - stopT0;
        setLastResult(result ?? null);

        console.log(
            `${ts(TAG)} finish() | Step 3 DONE: stopRecording took ${stopElapsed}ms | durationMs=${result?.durationMs ?? "?"}`
        );

        // 4. Mark consultation as finalized in store
        if (sessionId) {
            const finalDuration = result?.durationMs ?? durationMs ?? 0;
            console.log(
                `${ts(TAG)} finish() | Step 4: Marking consultation as finalized | duration=${finalDuration}ms`
            );

            store.getState().updateConsultation(sessionId, {
                userFinalized: true,
                finishedAt: Date.now(),
                durationMs: finalDuration,
                hasTempBuffer: false,
            });

            // 5. Wait for chunk queue to drain (dynamic timeout based on pending chunks)
            const consultation = store.getState().getConsultation(sessionId);
            const pendingCount = consultation?.chunks.filter(c => c.status !== "uploaded").length ?? 0;
            const drainTimeoutMs = Math.min(
                Math.max(30_000, pendingCount * 15_000), // 15s per pending chunk, min 30s
                300_000                                   // absolute max 5 min
            );

            console.log(`${ts(TAG)} finish() | Step 5: Waiting for upload queue to drain | timeout=${drainTimeoutMs}ms | pendingChunks=${pendingCount} | queueProcessing=${chunkUploadQueue.isHalted()}`);
            const drainStart = Date.now();
            const drained = await chunkUploadQueue.waitForDrain(drainTimeoutMs);
            const drainElapsed = Date.now() - drainStart;

            console.log(
                `${ts(TAG)} finish() | Queue drain result: drained=${drained} | elapsed=${drainElapsed}ms | halted=${chunkUploadQueue.isHalted()} | haltReason=${chunkUploadQueue.getHaltReason() ?? "none"}`
            );

            if (drained) {
                // All chunks uploaded — finalize
                console.log(`${ts(TAG)} finish() | All chunks uploaded — calling finalizeConsultation()...`);
                try {
                    await finalizeConsultation(sessionId);
                    console.log(`${ts(TAG)} finish() | ✅ Consultation FINALIZED as synced`);
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    console.warn(`${ts(TAG)} finish() | ⚠️ Finalization error: ${msg}`);
                }
            } else {
                // Some chunks still pending — will be synced later via autoSyncAll()
                store.getState().recomputeSyncStatus(sessionId);
                const status = store.getState().getConsultation(sessionId)?.syncStatus;
                console.log(
                    `${ts(TAG)} finish() | Queue did NOT drain — consultation left as ${status} — will sync later`
                );
            }
        }

        // 6. Clean up refs
        console.log(`${ts(TAG)} finish() | Step 6: Cleaning up refs`);
        chunkUploadQueue.clearSession();
        await chunkBufferRef.current?.reset();
        chunkBufferRef.current = null;
        setActiveSessionId(null);
        sessionMetaRef.current = null;
        audioEventCountRef.current = 0;

        console.log(`${ts(TAG)} finish() | ✅ DONE`);
        return null;
    }, [activeSessionId, stopRecording, durationMs, isRecording, isPaused]);

    // ── discard ───────────────────────────────────────────

    const discard = useCallback(async () => {
        const sessionId = activeSessionId;
        console.log(`${ts(TAG)} discard() | START | session=${sessionId}`);

        // Stop watchdog + buffer
        console.log(`${ts(TAG)} discard() | Stopping watchdog and buffer`);
        watchdogRef.current?.stop();
        watchdogRef.current = null;
        chunkBufferRef.current?.stop();
        await chunkBufferRef.current?.reset();
        chunkBufferRef.current = null;

        // Stop recording
        console.log(`${ts(TAG)} discard() | Stopping recording...`);
        await stopRecording();
        setLastResult(null);
        console.log(`${ts(TAG)} discard() | Recording stopped`);

        // Discard consultation data
        if (sessionId) {
            console.log(`${ts(TAG)} discard() | Discarding consultation ${sessionId}...`);
            try {
                await discardConsultation(sessionId);
                console.log(`${ts(TAG)} discard() | ✅ Consultation discarded`);
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.warn(`${ts(TAG)} discard() | ⚠️ Failed to discard consultation: ${msg}`);
            }
        }

        chunkUploadQueue.clearSession();
        setActiveSessionId(null);
        sessionMetaRef.current = null;
        audioEventCountRef.current = 0;

        console.log(`${ts(TAG)} discard() | ✅ DONE`);
    }, [activeSessionId, stopRecording]);

    // ── Context value ─────────────────────────────────────

    const value: RecorderCtxValue = useMemo(
        () => ({
            start,
            pause,
            resume,
            finish,
            discard,
            resetStreamDead,
            resetDiskFull,
            isRecording,
            isPaused,
            durationMs: durationMs ?? 0,
            lastResult,
            chunkProgress,
            activeSessionId,
            streamDead,
            diskFull,
        }),
        [start, pause, resume, finish, discard, resetStreamDead, resetDiskFull, isRecording, isPaused, durationMs, lastResult, chunkProgress, activeSessionId, streamDead, diskFull]
    );

    return <RecorderCtx.Provider value={value}>{children}</RecorderCtx.Provider>;
}

export function useRecorder() {
    const ctx = useContext(RecorderCtx);
    if (!ctx) throw new Error("useRecorder must be used inside RecorderProvider");
    return ctx;
}
