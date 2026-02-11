export function guessExtension(uri: string) {
    const lower = uri.toLowerCase();
    const match = lower.match(/\.(m4a|aac|wav|mp3)$/);
    return match?.[1] ?? "m4a";
}

export function guessContentTypeByExt(ext: string) {
    switch (ext) {
        case "m4a":
            return "audio/mp4";
        case "aac":
            return "audio/aac";
        case "wav":
            return "audio/wav";
        case "mp3":
            return "audio/mpeg";
        default:
            return "application/octet-stream";
    }
}
