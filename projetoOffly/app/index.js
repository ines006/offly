import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text>Página Inicial</Text>
      <View style={styles.buttonSpacing}>
        <Button
          title="Ir para Questionário"
          onPress={() => router.push("./components/questionario")}
        />
      </View>

      <View style={styles.buttonSpacing}>
        <Button
          title="Ir para UploadScreenTime"
          onPress={() => router.push("./components/UploadScreenTime")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonSpacing: {
    marginBottom: 10,
  },
});
