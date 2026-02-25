import { useCallback, useState } from "react";
import { ensureExampleConsultations } from "@/services/exampleConsultations";
import type { ExampleConsultation } from "@/types/consultationTypes";

export function useExampleConsultations() {
    const [items, setItems] = useState<ExampleConsultation[]>([]);

    const load = useCallback(async () => {
        const examples = await ensureExampleConsultations();
        setItems(examples);
    }, []);

    return { items, load };
}
