import { Text, View } from "react-native";
import { globalStyles } from "../../styles/theme";

export default function Dashboard() {
  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Dashboard</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardText}>Bem-vindo ao Catia 🚀</Text>
      </View>
    </View>
  );
}
