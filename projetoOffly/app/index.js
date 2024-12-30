import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <>
      <View style={styles.container}>
        <Text>Página Inicial</Text>
        <Button
          title="Ir para Questionário"
          onPress={() => router.push("./components/questionario")}
        />
        <Button
          title="Ir para pontuacao"
          onPress={() => router.push("./components/pontuacaoEquipa")}
        />
        <Button
          title="Ir para Navbar"
          onPress={() => router.push("./components/navbar")}
        />
        <Button
          title="Ir para shake"
          onPress={() => router.push("./components/shake")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
