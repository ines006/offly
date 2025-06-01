import React, { useContext, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../components/entrar/AuthContext";
import axios from "axios";
import { baseurl } from "../../api-config/apiConfig";

const VerificacaoDesafios = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const verificarDesafios = async () => {
      try {
        if (!user || !user.id) {
          console.error("Utilizador não autenticado.");
          router.push("/components/entrar/login");
          return;
        }

        console.log("ID do utilizador autenticado:", user.id);

        const response = await axios.get(`${baseurl}/api/verificar/${user.id}`);
        const { shakeFeito } = response.data;

        if (shakeFeito) {
          router.push("/components/desafio/desafioSemanal");
        } else {
          router.push("/components/desafio/descobrirDesafio");
        }

      } catch (error) {
        console.error("Erro ao verificar desafios:", error);
        router.push("/components/desafio/descobrirDesafio");
      }
    };

    verificarDesafios();
  }, [user, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>A verificar...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default VerificacaoDesafios;
