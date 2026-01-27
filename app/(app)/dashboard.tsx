import { Text, View } from "react-native";
import BottomBar from "../../components/app/BottomBar";
import { globalStyles } from "../../styles/theme";

export default function Dashboard() {
  return (
    <View style={globalStyles.screenWithBottomBar}>
      <View style={globalStyles.content}>
        <Text style={globalStyles.title}>Dashboard</Text>

        <View style={globalStyles.card}>
          <Text style={globalStyles.cardText}>Bem-vindo ao Catia 🚀</Text>
        </View>
      </View>

      <BottomBar />
    </View>
  );
}
