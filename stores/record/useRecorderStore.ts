import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { create } from "zustand";

// Tipos básicos
type SexKey = "male" | "female" | null;

type RecorderState = {
    // estado global
    isRecording: boolean;
    isPaused: boolean;

    // timer
    elapsedMs: number;
    startedAt: number | null;

    // metadata opcional (se quiser manter global também)
    patientName?: string;
    guardianName?: string;
    sex?: SexKey;

    // actions
    start: () => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    finish: () => Promise<{ uri: string | null; durationMs: number }>;
    discard: () => Promise<void>;

    // timer helpers
    tick: () => void;
    resetTimer: () => void;
};

let audioSingleton: ReturnType<typeof useAudioRecorder> | null = null;

/**
 * Observação:
 * - useAudioRecorder é um hook. Hook não pode ser chamado fora de componente.
 * Então aqui a gente NÃO chama o hook.
 * Solução: expor um "factory" no seu hook (preferível), ou mover a lógica pra um módulo que não seja hook.
 *
 * Abaixo eu te dou o jeito certo: refatorar o useAudioRecorder para exportar "createAudioRecorder".
 */
export const useRecorderStore = create<RecorderState>((set, get) => ({
    isRecording: false,
    isPaused: false,
    elapsedMs: 0,
    startedAt: null,

    start: async () => {
        if (!audioSingleton) throw new Error("Recorder não inicializado");
        if (get().isRecording && !get().isPaused) return;

        set({ isRecording: true, isPaused: false, startedAt: Date.now() });
        await audioSingleton.start();
    },

    pause: async () => {
        if (!audioSingleton) throw new Error("Recorder não inicializado");
        const { startedAt } = get();

        if (startedAt) {
            set({ elapsedMs: get().elapsedMs + (Date.now() - startedAt), startedAt: null });
        }

        set({ isRecording: false, isPaused: true });
        await audioSingleton.pause();
    },

    resume: async () => {
        if (!audioSingleton) throw new Error("Recorder não inicializado");

        set({ isRecording: true, isPaused: false, startedAt: Date.now() });
        await audioSingleton.resume();
    },

    finish: async () => {
        if (!audioSingleton) throw new Error("Recorder não inicializado");
        const { startedAt, elapsedMs } = get();

        const durationMs = elapsedMs + (startedAt ? Date.now() - startedAt : 0);
        set({ isRecording: false, isPaused: false, startedAt: null });

        const uri = await audioSingleton.finish();
        return { uri, durationMs };
    },

    discard: async () => {
        if (!audioSingleton) throw new Error("Recorder não inicializado");
        set({ isRecording: false, isPaused: false, elapsedMs: 0, startedAt: null });
        await audioSingleton.discard();
    },

    tick: () => set({}),
    resetTimer: () => set({ elapsedMs: 0, startedAt: null }),
}));

export function initRecorderStore(recorder: any) {
    audioSingleton = recorder;
}
