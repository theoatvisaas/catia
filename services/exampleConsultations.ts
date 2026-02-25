import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ExampleConsultation } from "@/types/consultationTypes";

const STORAGE_KEY = "@catia:exampleConsultations";

function createExamples(): ExampleConsultation[] {
    const now = Date.now();
    return [
        {
            sessionId: "example_1",
            patientName: "Biscoito",
            guardianName: "Maria Silva",
            durationMs: 90_000,
            createdAt: now,
            isExample: true,
        },
        {
            sessionId: "example_2",
            patientName: "Thor",
            guardianName: "João Santos",
            durationMs: 120_000,
            createdAt: now - 60_000,
            isExample: true,
        },
        {
            sessionId: "example_3",
            patientName: "Luna",
            guardianName: "Ana Oliveira",
            durationMs: 75_000,
            createdAt: now - 120_000,
            isExample: true,
        },
    ];
}

/**
 * Ensures example consultations exist in AsyncStorage.
 * Creates them on first call, returns existing ones on subsequent calls.
 */
export async function ensureExampleConsultations(): Promise<ExampleConsultation[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored) as ExampleConsultation[];
    }

    const examples = createExamples();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(examples));
    console.log("[ExampleConsultations] Created 3 example consultations");
    return examples;
}

/**
 * Reads example consultations from AsyncStorage.
 * Returns empty array if none exist.
 */
export async function getExampleConsultations(): Promise<ExampleConsultation[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ExampleConsultation[];
}

/**
 * Removes all example consultations from AsyncStorage.
 */
export async function removeExampleConsultations(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log("[ExampleConsultations] Removed example consultations");
}
