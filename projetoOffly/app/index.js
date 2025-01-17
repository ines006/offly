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

        <Button
          title="pag principal equipas"
          onPress={() => router.push("./PaginaPrincipal")}
        />

        <Button
          title="pag detalhes equipa criada"
          onPress={() => router.push("./EquipaCriada")}
          />

        <Button
          title="Ir para desafio"
          onPress={() => router.push("./components/desafio/desafioSemanal")}
        />
        <Button
          title="Ir para descobrir"
          onPress={() => router.push("./components/desafio/descobrirDesafio")}
        />
        <Button
          title="Upload"
          onPress={() => router.push("./components/uploadScreenTime/UploadScreen")}
        />
        <Button
          title="Upload desafio"
          onPress={() => router.push("./components/shake/UploadDesafio")}
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
