import { createAudioRecorder } from "@/lib/audioRecorder";
import { useMemo, useState } from "react";

export function useAudioRecorder() {
    const recorder = useMemo(() => createAudioRecorder(), []);
    const [uri, setUri] = useState<string | null>(null);

    return {
        uri,
        start: async () => {
            setUri(null);
            await recorder.start();
        },
        pause: recorder.pause,
        resume: recorder.resume,
        finish: async () => {
            const u = await recorder.finish();
            setUri(u);
            return u;
        },
        discard: async () => {
            setUri(null);
            await recorder.discard();
        },
    };
}
