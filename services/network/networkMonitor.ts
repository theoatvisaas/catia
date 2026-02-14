import { ts } from "@/lib/logger";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import type { NetworkStatus } from "@/types/consultationTypes";

const TAG = "[NetworkMonitor]";

type NetworkListener = (status: NetworkStatus) => void;

let currentStatus: NetworkStatus = { isConnected: true, type: "unknown" };
const listeners = new Set<NetworkListener>();
let unsubscribe: (() => void) | null = null;

function mapType(type: string): NetworkStatus["type"] {
    switch (type) {
        case "wifi":
            return "wifi";
        case "cellular":
            return "cellular";
        case "none":
            return "none";
        default:
            return "unknown";
    }
}

export function startNetworkMonitor(): void {
    if (unsubscribe) {
        console.log(`${ts(TAG)} startNetworkMonitor() | Already started, skipping`);
        return;
    }

    console.log(`${ts(TAG)} startNetworkMonitor() | Registering NetInfo listener...`);

    unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        const wasOffline = !currentStatus.isConnected;
        const prevType = currentStatus.type;

        currentStatus = {
            isConnected: state.isConnected ?? false,
            type: mapType(state.type),
        };

        console.log(
            `${ts(TAG)} Network change: ${prevType}(${wasOffline ? "offline" : "online"}) → ${currentStatus.type}(${currentStatus.isConnected ? "online" : "offline"}) | listeners=${listeners.size}`
        );

        listeners.forEach((l) => l(currentStatus));

        // When coming back online, trigger auto-sync
        if (wasOffline && currentStatus.isConnected) {
            console.log(`${ts(TAG)} 🔄 Network RESTORED (${currentStatus.type}) — triggering autoSyncAll()...`);
            import("../recordings/consultationSyncService")
                .then((m) => m.autoSyncAll())
                .then(() => {
                    console.log(`${ts(TAG)} autoSyncAll() triggered by network restore completed`);
                })
                .catch((err) => {
                    const msg = err instanceof Error ? err.message : String(err);
                    console.warn(`${ts(TAG)} ❌ Auto-sync after network restore FAILED: ${msg}`);
                });
        }
    });

    console.log(`${ts(TAG)} startNetworkMonitor() | ✅ Listener registered`);
}

export function stopNetworkMonitor(): void {
    console.log(`${ts(TAG)} stopNetworkMonitor() | active=${!!unsubscribe}`);
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
        console.log(`${ts(TAG)} stopNetworkMonitor() | ✅ Listener removed`);
    }
}

export function getNetworkStatus(): NetworkStatus {
    // [TEST] Scenario 4: Simulate offline
    if (__DEV__) {
        const { testFlags } = require("@/config/testFlags");
        if (testFlags.simulateOffline) {
            return { isConnected: false, type: "none" };
        }
    }

    return currentStatus;
}

export function onNetworkChange(listener: NetworkListener): () => void {
    listeners.add(listener);
    console.log(`${ts(TAG)} onNetworkChange() | Added listener (total=${listeners.size})`);
    return () => {
        listeners.delete(listener);
        console.log(`${ts(TAG)} onNetworkChange() | Removed listener (total=${listeners.size})`);
    };
}
