import type { MeResponse } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "@app:user";

export async function saveUser(me: MeResponse) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
}

export async function getUser(): Promise<MeResponse | null> {
    try {
        const raw = await AsyncStorage.getItem(USER_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as MeResponse;
    } catch {
        return null;
    }
}

export async function clearUser() {
    await AsyncStorage.removeItem(USER_KEY);
}
