import React from "react";
import { Text } from "react-native";

type Styles = {
    body: any;
    title: any;
    bold?: any;
    italic?: any;
    strike?: any;
};

const ZW_RE = /[\u200B-\u200D\uFEFF]/g;

function clean(s: string) {
    return (s ?? "").replace(ZW_RE, "");
}

function normalizeBoldTitle(s: string) {
    const v = clean(s).trim();

    let inner: string | null = null;

    if (v.startsWith("**") && v.endsWith("**")) inner = v.slice(2, -2);
    else if (v.startsWith("*") && v.endsWith("*")) inner = v.slice(1, -1);

    if (inner === null) return null;

    if (inner.includes("_") || inner.includes("~")) return null;

    return inner;
}

function stripOuterBold(raw: string) {
    const v = clean(raw);
    if (v.startsWith("**") && v.endsWith("**")) return { inner: v.slice(2, -2), had: true };
    if (v.startsWith("*") && v.endsWith("*")) return { inner: v.slice(1, -1), had: true };
    return { inner: v, had: false };
}

function stripOuterItalic(raw: string) {
    const v = clean(raw);
    if (v.startsWith("__") && v.endsWith("__")) return { inner: v.slice(2, -2), had: true };
    if (v.startsWith("_") && v.endsWith("_")) return { inner: v.slice(1, -1), had: true };
    return { inner: v, had: false };
}

function stripOuterStrike(raw: string) {
    const v = clean(raw);
    if (v.startsWith("~~") && v.endsWith("~~")) return { inner: v.slice(2, -2), had: true };
    if (v.startsWith("~") && v.endsWith("~")) return { inner: v.slice(1, -1), had: true };
    return { inner: v, had: false };
}

type Token = {
    kind:
    | "text"
    | "bold"
    | "italic"
    | "strike"
    | "boldItalic"
    | "boldStrike"
    | "italicStrike"
    | "boldItalicStrike";
    value: string;
};

function tokenizeInline(line: string): Token[] {
    const re =
        /(\*\*__[\s\S]+?__\*\*|\*__[\s\S]+?__\*|\*\*_[\s\S]+?_\*\*|\*_[\s\S]+?_\*|__\*\*[\s\S]+?\*\*__|_\*\*[\s\S]+?\*\*_|\_\*[\s\S]+?\*_|__\*[\s\S]+?\*__|\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|__[^_\n]+?__|_[^_\n]+?_|~~[\s\S]+?~~|~[\s\S]+?~)/g;

    const parts: Token[] = [];
    const src = clean(line);

    let last = 0;
    for (const m of src.matchAll(re)) {
        const start = m.index ?? 0;
        if (start > last) parts.push({ kind: "text", value: src.slice(last, start) });

        const raw = m[0];

        const { inner: afterBold, had: hadBoldOuter } = stripOuterBold(raw);
        const { inner: afterItalicInsideBold, had: hadItalicInsideBold } = stripOuterItalic(afterBold);

        if (hadBoldOuter && hadItalicInsideBold) {
            const innerStrike = stripOuterStrike(afterItalicInsideBold);
            if (innerStrike.had) {
                parts.push({ kind: "boldItalicStrike", value: innerStrike.inner });
            } else {
                parts.push({ kind: "boldItalic", value: afterItalicInsideBold });
            }

            last = start + raw.length;
            continue;
        }

        const { inner: afterItalic, had: hadItalicOuter } = stripOuterItalic(raw);
        const { inner: afterBoldInsideItalic, had: hadBoldInsideItalic } = stripOuterBold(afterItalic);

        if (hadItalicOuter && hadBoldInsideItalic) {
            const innerStrike = stripOuterStrike(afterBoldInsideItalic);
            if (innerStrike.had) {
                parts.push({ kind: "boldItalicStrike", value: innerStrike.inner });
            } else {
                parts.push({ kind: "boldItalic", value: afterBoldInsideItalic });
            }

            last = start + raw.length;
            continue;
        }

        const strikeOuter = stripOuterStrike(raw);
        if (strikeOuter.had) {
            const inside = strikeOuter.inner;

            {
                const { inner: afterBold2, had: hadBold2 } = stripOuterBold(inside);
                const { inner: afterItalic2, had: hadItalic2 } = stripOuterItalic(afterBold2);

                if (hadBold2 && hadItalic2) {
                    parts.push({ kind: "boldItalicStrike", value: afterItalic2 });
                    last = start + raw.length;
                    continue;
                }
            }
            {
                const { inner: afterItalic2, had: hadItalic2 } = stripOuterItalic(inside);
                const { inner: afterBold2, had: hadBold2 } = stripOuterBold(afterItalic2);

                if (hadBold2 && hadItalic2) {
                    parts.push({ kind: "boldItalicStrike", value: afterBold2 });
                    last = start + raw.length;
                    continue;
                }
            }

            const b2 = stripOuterBold(inside);
            if (b2.had) {
                parts.push({ kind: "boldStrike", value: b2.inner });
                last = start + raw.length;
                continue;
            }

            const i2 = stripOuterItalic(inside);
            if (i2.had) {
                parts.push({ kind: "italicStrike", value: i2.inner });
                last = start + raw.length;
                continue;
            }

            parts.push({ kind: "strike", value: inside });
            last = start + raw.length;
            continue;
        }

        const boldTry = stripOuterBold(raw);
        if (boldTry.had) {
            const innerStrike = stripOuterStrike(boldTry.inner);
            if (innerStrike.had) {
                parts.push({ kind: "boldStrike", value: innerStrike.inner });
            } else {
                parts.push({ kind: "bold", value: boldTry.inner });
            }

            last = start + raw.length;
            continue;
        }

        const italicTry = stripOuterItalic(raw);
        if (italicTry.had) {
            const innerStrike = stripOuterStrike(italicTry.inner);
            if (innerStrike.had) {
                parts.push({ kind: "italicStrike", value: innerStrike.inner });
            } else {
                parts.push({ kind: "italic", value: italicTry.inner });
            }

            last = start + raw.length;
            continue;
        }

        const strikeTry = stripOuterStrike(raw);
        if (strikeTry.had) {
            parts.push({ kind: "strike", value: strikeTry.inner });
            last = start + raw.length;
            continue;
        }

        parts.push({ kind: "text", value: raw });
        last = start + raw.length;
    }

    if (last < src.length) parts.push({ kind: "text", value: src.slice(last) });
    return parts;
}

export function renderWhatsText(text: string, styles: Styles) {
    const lines = clean(text || "").replace(/\r\n/g, "\n").split("\n");

    return lines.map((line, i) => {
        const trimmed = line.trim();

        const title = trimmed ? normalizeBoldTitle(trimmed) : null;
        if (title !== null) {
            return (
                <Text key={`t-${i}`} style={[styles.title]}>
                    {title}
                </Text>
            );
        }

        const tokens = tokenizeInline(line);

        return (
            <Text key={`l-${i}`} style={styles.body}>
                {tokens.map((t, idx) => {
                    if (t.kind === "boldItalic") {
                        return (
                            <Text key={idx} style={[styles.bold, styles.italic]}>
                                {t.value}
                            </Text>
                        );
                    }
                    if (t.kind === "bold") return <Text key={idx} style={styles.bold}>{t.value}</Text>;
                    if (t.kind === "italic") return <Text key={idx} style={styles.italic}>{t.value}</Text>;
                    if (t.kind === "strike") return <Text key={idx} style={styles.strike}>{t.value}</Text>;
                    if (t.kind === "boldStrike") {
                        return (
                            <Text key={idx} style={[styles.bold, styles.strike]}>
                                {t.value}
                            </Text>
                        );
                    }

                    if (t.kind === "italicStrike") {
                        return (
                            <Text key={idx} style={[styles.italic, styles.strike]}>
                                {t.value}
                            </Text>
                        );
                    }

                    if (t.kind === "boldItalicStrike") {
                        return (
                            <Text key={idx} style={[styles.bold, styles.italic, styles.strike]}>
                                {t.value}
                            </Text>
                        );
                    }

                    return <Text key={idx}>{t.value}</Text>;
                })}
                {"\n"}
            </Text>
        );
    });
}
