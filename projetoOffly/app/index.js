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
          onPress={() => router.push("./questionario")}
        />
        <Button
          title="Ir para pontuacao"
          onPress={() =>
            router.push("./components/leaderboard/pontuacaoEquipa")
          }
        />
        <Button
          title="Ir para Navbar"
          onPress={() => router.push("./components/navbar")}
        />
        <Button
          title="Ir para shake"
          onPress={() => router.push("./components/shake/shake")}
        />
        <Button
          title="Ir para Pódio"
          onPress={() => router.push("./components/leaderboard/podio")}
        />
        <Button
          title="Ver fluxo atual"
          onPress={() => router.push("./components/entrar/login")}
        />
        <Button
          title="Ir para UploadScreenTime"
          onPress={() => router.push("./components/UploadScreenTime")}
        />

        <Button
          title="Ir para caderneta"
          onPress={() => router.push("./components/caderneta/caderneta")}
        />

        <Button
          title="Ir para Página Principal após login"
          onPress={() =>
            router.push("./components/pag-principal-lg/pag-principal-lg")
          }
        />
        <Button
          title="Ir para Página Principal"
          onPress={() =>
          router.push("../components/pag-principal-lg/pag-principal-lg")
          }
        />
        <Button
          title="Ir para perfil"
          onPress={() => router.push("./perfil")}
        />
        <Button
          title="Ir para onboarding"
          onPress={() => router.push("./onboarding")}
        />
      </View>

      <View style={styles.buttonSpacing}>
        <Button
          title="Ir para PaginaPrincipal"
          onPress={() => router.push("./PaginaPrincipal")}
        />
      </View>

      <View style={styles.buttonSpacing}>
        <Button
          title="Ir para a pagina EquipaCriada"
          onPress={() => router.push("./EquipaCriada")}
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

  buttonSpacing: {
    marginBottom: 10,
  },
});
