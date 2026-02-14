import { ts } from "@/lib/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
    ChunkRecord,
    ChunkSyncStatus,
    Consultation,
    ConsultationSyncStatus,
} from "@/types/consultationTypes";
import type { SexKey } from "@/types/uploadTypes";

const TAG = "[ConsultationStore]";

// ── Types ────────────────────────────────────────────────

type CreateConsultationParams = {
    sessionId: string;
    userId: string;
    patientName: string;
    guardianName: string;
    sex: SexKey;
    bucket: string;
};

type ConsultationState = {
    consultations: Record<string, Consultation>;
    hydrated: boolean;

    // ── Lifecycle ────────────────────────────────────────
    createConsultation: (params: CreateConsultationParams) => Consultation;
    updateConsultation: (sessionId: string, patch: Partial<Consultation>) => void;
    removeConsultation: (sessionId: string) => void;

    // ── Chunk tracking ──────────────────────────────────
    addChunk: (sessionId: string, chunk: ChunkRecord) => void;
    updateChunkStatus: (
        sessionId: string,
        chunkIndex: number,
        status: ChunkSyncStatus,
        extra?: Partial<ChunkRecord>
    ) => void;

    // ── Sync status ─────────────────────────────────────
    setSyncStatus: (sessionId: string, status: ConsultationSyncStatus) => void;
    recomputeSyncStatus: (sessionId: string) => void;

    // ── Queries ─────────────────────────────────────────
    getConsultation: (sessionId: string) => Consultation | undefined;
    getConsultationsByStatus: (status: ConsultationSyncStatus) => Consultation[];
    getAllConsultations: () => Consultation[];
    getIncompleteConsultations: () => Consultation[];

    // ── Guards ───────────────────────────────────────────
    hasActiveRecording: () => boolean;
    getActiveRecording: () => Consultation | undefined;
};

// ── Store ────────────────────────────────────────────────

export const useConsultationStore = create<ConsultationState>()(
    persist(
        (set, get) => ({
            consultations: {},
            hydrated: false,

            // ── Lifecycle ────────────────────────────────

            createConsultation: (params) => {
                const storagePrefix = `${params.userId}/recordings/${params.sessionId}`;
                console.log(
                    `${ts(TAG)} createConsultation() | session=${params.sessionId} | patient=${params.patientName} | guardian=${params.guardianName} | sex=${params.sex} | bucket=${params.bucket} | storagePrefix=${storagePrefix}`
                );

                const consultation: Consultation = {
                    sessionId: params.sessionId,
                    userId: params.userId,
                    patientName: params.patientName,
                    guardianName: params.guardianName,
                    sex: params.sex,
                    syncStatus: "local",
                    chunks: [],
                    nextChunkIndex: 0,
                    bucket: params.bucket,
                    storagePrefix,
                    createdAt: Date.now(),
                    durationMs: 0,
                    globalRetryCount: 0,
                    hasTempBuffer: false,
                    userFinalized: false,
                };

                set((state) => ({
                    consultations: {
                        ...state.consultations,
                        [params.sessionId]: consultation,
                    },
                }));

                const totalCount = Object.keys(get().consultations).length;
                console.log(
                    `${ts(TAG)} createConsultation() | ✅ Created | syncStatus=local | totalConsultations=${totalCount}`
                );

                return consultation;
            },

            updateConsultation: (sessionId, patch) => {
                const patchKeys = Object.keys(patch);
                console.log(
                    `${ts(TAG)} updateConsultation(${sessionId}) | fields=[${patchKeys.join(", ")}]`
                );

                set((state) => {
                    const existing = state.consultations[sessionId];
                    if (!existing) {
                        console.warn(`${ts(TAG)} updateConsultation() | ⚠️ Session ${sessionId} not found`);
                        return state;
                    }

                    return {
                        consultations: {
                            ...state.consultations,
                            [sessionId]: { ...existing, ...patch },
                        },
                    };
                });
            },

            removeConsultation: (sessionId) => {
                console.log(`${ts(TAG)} removeConsultation(${sessionId})`);

                set((state) => {
                    const { [sessionId]: _, ...rest } = state.consultations;
                    console.log(
                        `${ts(TAG)} removeConsultation() | ✅ Removed | remaining=${Object.keys(rest).length}`
                    );
                    return { consultations: rest };
                });
            },

            // ── Chunk tracking ───────────────────────────

            addChunk: (sessionId, chunk) => {
                console.log(
                    `${ts(TAG)} addChunk(${sessionId}) | chunk=#${chunk.index} order=${chunk.order} | status=${chunk.status} | ~${chunk.sizeBytes}B | storagePath=${chunk.storagePath} | localFile=${chunk.localFilePath ?? "none"}`
                );

                set((state) => {
                    const existing = state.consultations[sessionId];
                    if (!existing) {
                        console.warn(`${ts(TAG)} addChunk() | ⚠️ Session ${sessionId} not found`);
                        return state;
                    }

                    const newNextIndex = Math.max(existing.nextChunkIndex, chunk.index + 1);

                    console.log(
                        `${ts(TAG)} addChunk() | totalChunks=${existing.chunks.length + 1} | nextChunkIndex=${newNextIndex}`
                    );

                    return {
                        consultations: {
                            ...state.consultations,
                            [sessionId]: {
                                ...existing,
                                chunks: [...existing.chunks, chunk],
                                nextChunkIndex: newNextIndex,
                            },
                        },
                    };
                });
            },

            updateChunkStatus: (sessionId, chunkIndex, status, extra) => {
                const extraStr = extra ? ` | extra=[${Object.keys(extra).join(", ")}]` : "";
                console.log(
                    `${ts(TAG)} updateChunkStatus(${sessionId}) | chunk=#${chunkIndex} → ${status}${extraStr}`
                );

                set((state) => {
                    const existing = state.consultations[sessionId];
                    if (!existing) {
                        console.warn(`${ts(TAG)} updateChunkStatus() | ⚠️ Session ${sessionId} not found`);
                        return state;
                    }

                    const chunks = existing.chunks.map((c) =>
                        c.index === chunkIndex
                            ? { ...c, status, ...extra }
                            : c
                    );

                    const lastSyncedAt =
                        status === "uploaded" ? Date.now() : existing.lastSyncedAt;

                    // Log chunk summary
                    const uploaded = chunks.filter((c) => c.status === "uploaded").length;
                    const pending = chunks.filter((c) => c.status === "pending_local").length;
                    const failed = chunks.filter((c) => c.status === "failed").length;
                    const uploading = chunks.filter((c) => c.status === "uploading").length;
                    console.log(
                        `${ts(TAG)} updateChunkStatus() | Chunks summary: ${uploaded}✅ ${uploading}⬆️ ${pending}📁 ${failed}❌ / ${chunks.length} total`
                    );

                    return {
                        consultations: {
                            ...state.consultations,
                            [sessionId]: { ...existing, chunks, lastSyncedAt },
                        },
                    };
                });
            },

            // ── Sync status ──────────────────────────────

            setSyncStatus: (sessionId, status) => {
                console.log(`${ts(TAG)} setSyncStatus(${sessionId}) → ${status}`);

                set((state) => {
                    const existing = state.consultations[sessionId];
                    if (!existing) {
                        console.warn(`${ts(TAG)} setSyncStatus() | ⚠️ Session ${sessionId} not found`);
                        return state;
                    }

                    return {
                        consultations: {
                            ...state.consultations,
                            [sessionId]: { ...existing, syncStatus: status },
                        },
                    };
                });
            },

            recomputeSyncStatus: (sessionId) => {
                const consultation = get().consultations[sessionId];
                if (!consultation) {
                    console.warn(`${ts(TAG)} recomputeSyncStatus() | ⚠️ Session ${sessionId} not found`);
                    return;
                }

                let newStatus: ConsultationSyncStatus;

                if (consultation.chunks.length === 0) {
                    newStatus = "local";
                } else {
                    const allUploaded = consultation.chunks.every(
                        (c) => c.status === "uploaded"
                    );
                    const anyUploaded = consultation.chunks.some(
                        (c) => c.status === "uploaded"
                    );
                    const allPendingLocal = consultation.chunks.every(
                        (c) => c.status === "pending_local"
                    );

                    if (allUploaded && consultation.userFinalized) {
                        newStatus = "synced";
                    } else if (allPendingLocal) {
                        newStatus = "local";
                    } else if (anyUploaded) {
                        newStatus = "partial";
                    } else {
                        newStatus = "local";
                    }
                }

                const uploaded = consultation.chunks.filter((c) => c.status === "uploaded").length;
                console.log(
                    `${ts(TAG)} recomputeSyncStatus(${sessionId}) | ${consultation.syncStatus} → ${newStatus} | chunks=${uploaded}/${consultation.chunks.length} uploaded | finalized=${consultation.userFinalized}`
                );

                if (newStatus !== consultation.syncStatus) {
                    get().setSyncStatus(sessionId, newStatus);
                }
            },

            // ── Queries ──────────────────────────────────

            getConsultation: (sessionId) => {
                return get().consultations[sessionId];
            },

            getConsultationsByStatus: (status) => {
                return Object.values(get().consultations)
                    .filter((c) => c.syncStatus === status)
                    .sort((a, b) => b.createdAt - a.createdAt);
            },

            getAllConsultations: () => {
                return Object.values(get().consultations)
                    .sort((a, b) => b.createdAt - a.createdAt);
            },

            getIncompleteConsultations: () => {
                return Object.values(get().consultations)
                    .filter(
                        (c) =>
                            c.syncStatus === "local" ||
                            c.syncStatus === "partial"
                    )
                    .sort((a, b) => b.createdAt - a.createdAt);
            },

            // ── Guards ───────────────────────────────────

            hasActiveRecording: () => {
                const active = Object.values(get().consultations).some(
                    (c) => !c.userFinalized && c.syncStatus !== "discarded"
                );
                console.log(`${ts(TAG)} hasActiveRecording() → ${active}`);
                return active;
            },

            getActiveRecording: () => {
                const active = Object.values(get().consultations).find(
                    (c) => !c.userFinalized && c.syncStatus !== "discarded"
                );
                if (active) {
                    console.log(
                        `${ts(TAG)} getActiveRecording() → ${active.sessionId} (status=${active.syncStatus}, chunks=${active.chunks.length})`
                    );
                } else {
                    console.log(`${ts(TAG)} getActiveRecording() → none`);
                }
                return active;
            },
        }),
        {
            name: "@catia:consultations",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ consultations: state.consultations }),
            onRehydrateStorage: () => (_state, error) => {
                if (error) {
                    console.warn(`${ts(TAG)} ❌ Rehydrate error:`, error);
                } else {
                    const store = useConsultationStore.getState();
                    const count = Object.keys(store.consultations).length;
                    console.log(`${ts(TAG)} ✅ Rehydrated from AsyncStorage | ${count} consultation(s)`);

                    // Log summary of each consultation
                    for (const c of Object.values(store.consultations)) {
                        const uploaded = c.chunks.filter((ch) => ch.status === "uploaded").length;
                        const pending = c.chunks.filter((ch) => ch.status !== "uploaded").length;
                        console.log(
                            `${ts(TAG)}   → ${c.sessionId} | status=${c.syncStatus} | finalized=${c.userFinalized} | chunks: ${uploaded}✅ ${pending}⏳ / ${c.chunks.length}`
                        );
                    }
                }
                useConsultationStore.setState({ hydrated: true });
            },
        }
    )
);
