import React, { useContext, useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../components/entrar/AuthContext";
import axios from "axios";
import { baseurl } from "../../api-config/apiConfig";

const VerificacaoDesafios = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [teamId, setTeamId] = useState(null);

  useEffect(() => {
    const verificarDesafios = async () => {
      try {
        if (!user || !user.id) {
          console.error("Utilizador não autenticado.");
          router.push("/components/entrar/login");
          return;
        }

        const response = await axios.get(`${baseurl}/api/verificar/${user.id}`);
        const { shakeFeito, teamId } = response.data;

        console.log("🏷️ teamId:", teamId);
        setTeamId(teamId); // se quiseres guardar em estado

        if (shakeFeito) {
          router.push(`/components/desafio/desafioSemanal?teamId=${teamId}`);
        } else {
          router.push(`/components/desafio/descobrirDesafio?teamId=${teamId}`);
        }

      } catch (error) {
        console.error("Erro ao verificar desafios:", error);
        router.push({
          pathname: "/components/desafio/descobrirDesafio",
          params: { teamId: "none" },
        });
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
