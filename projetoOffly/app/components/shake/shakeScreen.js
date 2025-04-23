import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { AuthContext } from "../entrar/AuthContext"; // Ajusta o caminho conforme necessário
import Shake from "./shake";
import CartaSelecionada2 from "./cartaSelecionada2"; // Componente para mostrar carta

export default function ShakeScreen() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [carta, setCarta] = useState(null);

  useEffect(() => {
    const fetchCarta = async () => {
      if (!user) {
        console.warn("❌ Utilizador não autenticado.");
        setLoading(false);
        return;
      }

      console.log("👤 Utilizador autenticado:", user);

      // Simular busca de carta
      setTimeout(() => {
        const cartaFicticia = {
          id: "12345",
          nome: "Carta Exemplo",
          descricao: "Esta é uma carta fictícia para teste.",
          validada: false,
        };

        setCarta(cartaFicticia);
        setLoading(false);
      }, 1000); // Simula delay
    };

    fetchCarta();
  }, [user]);

  const handleValidated = () => {
    console.log("✅ Carta validada com sucesso!");
    setCarta(null);
    setLoading(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#263A83" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Nenhum utilizador autenticado.</Text>
      </View>
    );
  }

  if (!carta) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Nenhuma carta precisa de validação.</Text>
        <Shake />
      </View>
    );
  }

  return (
    <CartaSelecionada2
      carta={carta}
      userId={user.id || user.uid}
      cartaId={carta.id}
      onValidated={handleValidated}
    />
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
