import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { AuthContext } from "../entrar/AuthContext";
import Shake from "./shake";
import CartaSelecionada2 from "./cartaSelecionada2";
import EsperaShake from "./esperaShake";
import axios from "axios";
import { baseurl } from "../../api-config/apiConfig";

export default function ShakeScreen() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [cartaAtiva, setCartaAtiva] = useState(null);
  const [cartaDoDia, setCartaDoDia] = useState(null);

  useEffect(() => {
    const fetchCartas = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      // Resetar antes de começar
      setCartaAtiva(null);
      setCartaDoDia(null);

      try {
        const resAtiva = await axios.get(
          `${baseurl}/api/participants-has-challenges/active/${user.id}`
        );
        if (resAtiva.data) {
          console.log("📨 Carta ativa encontrada:", resAtiva.data);
          setCartaAtiva(resAtiva.data);
        }
      } catch (error) {
      }

      try {
        const resDia = await axios.get(
          `${baseurl}/api/participants-has-challenges/completed-today/${user.id}`
        );
        if (resDia.data) {
          console.log("📨 Carta do dia encontrada:", resDia.data);
          setCartaDoDia(resDia.data);
        }
      } catch (error) {
      }

      setLoading(false);
    };

    fetchCartas();
  }, [user]);

  const handleValidated = () => {
    console.log("✅ Carta validada com sucesso!");
    setCartaAtiva(null);
    setCartaDoDia(null);
    setLoading(true); // re-dispara o fetchCartas
  };

  // 1. Carregando
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#263A83" />
      </View>
    );
  }

  // 2. Utilizador não autenticado
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Nenhum utilizador autenticado.</Text>
      </View>
    );
  }

  // 3. Carta ativa encontrada → renderiza cartaSelecionada2
  if (cartaAtiva) {
    return (
      <CartaSelecionada2
        carta={cartaAtiva}
        userId={user.id}
        cartaId={cartaAtiva.id}
        onValidated={handleValidated}
      />
    );
  }

  // 4. Carta do dia encontrada → renderiza esperaShake
  if (cartaDoDia) {
    return (
      <EsperaShake
        carta={cartaDoDia}
        userId={user.id}
      />
    );
  }

  // 5. Nenhuma carta → renderiza componente padrão
  return (
    <View style={styles.container}>
      <Shake />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    color: "#FF0000",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
