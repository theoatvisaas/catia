import { Audio } from "expo-av";

export type AudioRecorder = {
    start: () => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    finish: () => Promise<string | null>;
    discard: () => Promise<void>;
};

export function createAudioRecorder(): AudioRecorder {
    let rec: Audio.Recording | null = null;

    async function cleanup() {
        if (!rec) return;
        try {
            await rec.stopAndUnloadAsync();
        } catch { }
        rec = null;
    }

    return {
        async start() {
            const perm = await Audio.requestPermissionsAsync();
            if (!perm.granted) throw new Error("Permissão de microfone negada");

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
            });

            await cleanup();

            const next = new Audio.Recording();
            await next.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            await next.startAsync();
            rec = next;
        },

        async pause() {
            if (!rec) return;
            await rec.pauseAsync();
        },

        async resume() {
            if (!rec) return;
            await rec.startAsync();
        },

        async finish() {
            if (!rec) return null;

            try {
                await rec.stopAndUnloadAsync();
                return rec.getURI() ?? null;
            } finally {
                rec = null;
            }
        },

        async discard() {
            await cleanup();
        },
    };
}
