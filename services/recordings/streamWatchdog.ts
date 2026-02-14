/**
 * Detects when the onAudioStream callback stops firing,
 * which indicates the OS killed the recording service,
 * or the app returned from background with a stale state.
 */
export class StreamWatchdog {
    private lastEventAt = 0;
    private timerId: ReturnType<typeof setInterval> | null = null;
    private onDead: () => void;
    private timeoutMs: number;

    constructor(opts: { timeoutMs?: number; onDead: () => void }) {
        this.timeoutMs = opts.timeoutMs ?? 5000;
        this.onDead = opts.onDead;
    }

    /** Call on every onAudioStream event to signal the stream is alive. */
    heartbeat(): void {
        this.lastEventAt = Date.now();
    }

    start(): void {
        this.lastEventAt = Date.now();
        this.timerId = setInterval(() => {
            if (Date.now() - this.lastEventAt > this.timeoutMs) {
                this.stop();
                this.onDead();
            }
        }, 2000);
    }

    stop(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }
}
