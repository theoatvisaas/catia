import type { RecordingConfig } from "@siteed/expo-audio-studio";

export type AudioRecorder = {
    start: () => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    finish: () => Promise<string | null>;
    discard: () => Promise<void>;
};

export function createSpeechRecordingConfig(): RecordingConfig {
  return {
    sampleRate: 16000,
    channels: 1,
    encoding: "pcm_16bit",
    keepAwake: true,
    showNotification: true,
    interval: 1000,

    output: {
      primary: { enabled: false },
      compressed: {
        enabled: true,
        format: "aac",
        bitrate: 64000,
      },
    },

    autoResumeAfterInterruption: true,
  };
}