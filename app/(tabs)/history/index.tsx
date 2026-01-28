import { Text, View } from "react-native";

export default function HistoryScreen() {
    return (
        <View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F8FAFC",
            }}
        >
            <Text style={{ fontSize: 18, fontWeight: "600" }}>
                Histórico
            </Text>

            <Text style={{ marginTop: 8, color: "#64748B" }}>
                Tela de histórico (placeholder)
            </Text>
        </View>
    );
}
