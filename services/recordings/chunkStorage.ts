import * as FileSystem from "expo-file-system";
import { ts } from "@/lib/logger";

const TAG = "[ChunkStorage]";
const CHUNKS_BASE_DIR = `${FileSystem.documentDirectory}chunks/`;

const MIN_DISK_SPACE_BYTES = 50 * 1024 * 1024; // 50MB

// ── Directory management ─────────────────────────────────

function sessionDir(sessionId: string): string {
    return `${CHUNKS_BASE_DIR}${sessionId}/`;
}

export async function ensureChunkDir(sessionId: string): Promise<string> {
    const dir = sessionDir(sessionId);
    console.log(`${ts(TAG)} ensureChunkDir() | session=${sessionId} | dir=${dir}`);

    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
        console.log(`${ts(TAG)} ensureChunkDir() | Creating directory: ${dir}`);
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        console.log(`${ts(TAG)} ensureChunkDir() | ✅ Directory created`);
    } else {
        console.log(`${ts(TAG)} ensureChunkDir() | Directory already exists`);
    }
    return dir;
}

// ── Chunk file I/O ───────────────────────────────────────

export async function saveChunkLocally(
    sessionId: string,
    chunkIndex: number,
    base64Lines: string[]
): Promise<string> {
    const dir = await ensureChunkDir(sessionId);
    const filePath = `${dir}chunk_${String(chunkIndex).padStart(4, "0")}.b64`;

    const dataToWrite = base64Lines.join("\n");
    const totalB64Len = base64Lines.reduce((sum, s) => sum + s.length, 0);
    const estimatedAudioBytes = Math.ceil((totalB64Len * 3) / 4);

    console.log(
        `${ts(TAG)} saveChunkLocally() | session=${sessionId} | chunk=#${chunkIndex} | ${base64Lines.length} lines | ~${estimatedAudioBytes}B | path=${filePath}`
    );

    await FileSystem.writeAsStringAsync(filePath, dataToWrite, {
        encoding: FileSystem.EncodingType.UTF8,
    });

    console.log(`${ts(TAG)} saveChunkLocally() | ✅ Chunk #${chunkIndex} saved (${dataToWrite.length} chars written)`);
    return filePath;
}

export async function readLocalChunk(filePath: string): Promise<string[]> {
    console.log(`${ts(TAG)} readLocalChunk() | path=${filePath}`);

    const raw = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.UTF8,
    });

    const lines = raw.split("\n").filter((line) => line.length > 0);
    const totalB64Len = lines.reduce((sum, s) => sum + s.length, 0);
    const estimatedAudioBytes = Math.ceil((totalB64Len * 3) / 4);

    console.log(
        `${ts(TAG)} readLocalChunk() | ✅ Read ${lines.length} lines | rawLen=${raw.length} chars | ~${estimatedAudioBytes}B audio`
    );
    return lines;
}

export async function deleteLocalChunk(filePath: string): Promise<void> {
    console.log(`${ts(TAG)} deleteLocalChunk() | path=${filePath}`);
    try {
        const info = await FileSystem.getInfoAsync(filePath);
        if (info.exists) {
            await FileSystem.deleteAsync(filePath, { idempotent: true });
            console.log(`${ts(TAG)} deleteLocalChunk() | ✅ Deleted`);
        } else {
            console.log(`${ts(TAG)} deleteLocalChunk() | File doesn't exist (already deleted?)`);
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`${ts(TAG)} deleteLocalChunk() | ⚠️ Failed: ${msg}`);
    }
}

export async function deleteSessionChunks(sessionId: string): Promise<void> {
    const dir = sessionDir(sessionId);
    console.log(`${ts(TAG)} deleteSessionChunks() | session=${sessionId} | dir=${dir}`);

    try {
        const info = await FileSystem.getInfoAsync(dir);
        if (info.exists) {
            await FileSystem.deleteAsync(dir, { idempotent: true });
            console.log(`${ts(TAG)} deleteSessionChunks() | ✅ Session directory deleted`);
        } else {
            console.log(`${ts(TAG)} deleteSessionChunks() | Directory doesn't exist (already cleaned?)`);
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`${ts(TAG)} deleteSessionChunks() | ⚠️ Failed: ${msg}`);
    }
}

// ── Temp buffer path (per-session) ───────────────────────

export function getTempBufferPath(sessionId: string): string {
    const path = `${CHUNKS_BASE_DIR}${sessionId}/buffer_temp.b64`;
    return path;
}

// ── Disk space ───────────────────────────────────────────

export async function getAvailableDiskSpace(): Promise<number | null> {
    // [TEST] Scenario 12: Simulate disk full
    if (__DEV__) {
        const { testFlags } = require("@/config/testFlags");
        if (testFlags.simulateDiskFull) {
            console.log(`[TEST] Simulated: Disk space LOW (10MB)`);
            return 10 * 1024 * 1024; // 10MB — below 50MB threshold
        }
    }

    try {
        const freeBytes = await FileSystem.getFreeDiskStorageAsync();
        const freeMB = (freeBytes / 1024 / 1024).toFixed(0);
        console.log(`${ts(TAG)} getAvailableDiskSpace() | ${freeMB}MB free (${freeBytes} bytes)`);
        return freeBytes;
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`${ts(TAG)} getAvailableDiskSpace() | ⚠️ Failed to check: ${msg}`);
        return null;
    }
}

export function isDiskSpaceLow(freeBytes: number | null): boolean {
    if (freeBytes === null) {
        console.log(`${ts(TAG)} isDiskSpaceLow() | Can't determine — assuming OK`);
        return false;
    }
    const isLow = freeBytes < MIN_DISK_SPACE_BYTES;
    const freeMB = (freeBytes / 1024 / 1024).toFixed(0);
    if (isLow) {
        console.warn(`${ts(TAG)} isDiskSpaceLow() | ⚠️ YES — only ${freeMB}MB free (threshold: ${MIN_DISK_SPACE_BYTES / 1024 / 1024}MB)`);
    }
    return isLow;
}
