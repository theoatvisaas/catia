import { useEffect, useState } from "react";
import {
    getNetworkStatus,
    onNetworkChange,
} from "@/services/network/networkMonitor";
import type { NetworkStatus } from "@/types/consultationTypes";

export function useNetworkStatus(): NetworkStatus {
    const [status, setStatus] = useState<NetworkStatus>(getNetworkStatus());

    useEffect(() => {
        const unsub = onNetworkChange(setStatus);
        return unsub;
    }, []);

    return status;
}
