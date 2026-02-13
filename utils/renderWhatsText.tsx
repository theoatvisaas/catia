import React from "react";
import { Text } from "react-native";

type Styles = {
    body: any;
    title: any;
    bold?: any;
    italic?: any;
    strike?: any;
};

function normalizeBold(s: string) {
    // aceita *titulo* e **titulo**
    if (s.startsWith("**") && s.endsWith("**")) return s.slice(2, -2);
    if (s.startsWith("*") && s.endsWith("*")) return s.slice(1, -1);
    return null;
}

function tokenizeInline(line: string) {
    // tokens: *bold*  _italic_  ~strike~
    const re = /(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~)/g;
    const parts: Array<{ kind: "text" | "bold" | "italic" | "strike"; value: string }> = [];

    let last = 0;
    for (const m of line.matchAll(re)) {
        const start = m.index ?? 0;
        if (start > last) parts.push({ kind: "text", value: line.slice(last, start) });

        const raw = m[0];
        if (raw.startsWith("*")) parts.push({ kind: "bold", value: raw.slice(1, -1) });
        else if (raw.startsWith("_")) parts.push({ kind: "italic", value: raw.slice(1, -1) });
        else if (raw.startsWith("~")) parts.push({ kind: "strike", value: raw.slice(1, -1) });

        last = start + raw.length;
    }

    if (last < line.length) parts.push({ kind: "text", value: line.slice(last) });
    return parts;
}

export function renderWhatsText(text: string, styles: Styles) {
    const lines = (text || "").replace(/\r\n/g, "\n").split("\n");

    return lines.map((line, i) => {
        const trimmed = line.trim();

        // regra de "título": linha inteira em *...* ou **...**
        const title = trimmed ? normalizeBold(trimmed) : null;
        if (title !== null) {
            return (
                <Text key={`t-${i}`} style={[styles.title]}>{title}</Text>
            );
        }

        const tokens = tokenizeInline(line);

        return (
            <Text key={`l-${i}`} style={styles.body}>
                {tokens.map((t, idx) => {
                    if (t.kind === "bold") return <Text key={idx} style={styles.bold}>{t.value}</Text>;
                    if (t.kind === "italic") return <Text key={idx} style={styles.italic}>{t.value}</Text>;
                    if (t.kind === "strike") return <Text key={idx} style={styles.strike}>{t.value}</Text>;
                    return <Text key={idx}>{t.value}</Text>;
                })}
                {"\n"}
            </Text>
        );
    });
}
