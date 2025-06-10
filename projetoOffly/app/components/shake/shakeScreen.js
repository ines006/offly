import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { AuthContext } from "../entrar/AuthContext";
import Shake from "./shake";
import CartaSelecionada2 from "./cartaSelecionada2";
import axios from "axios";
import { baseurl } from "../../api-config/apiConfig"; 

export default function ShakeScreen() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [carta, setCarta] = useState(null);

  useEffect(() => {
    const fetchCartaAtiva = async () => {
      if (!user || !user.id) {
        console.warn("❌ Utilizador não autenticado ou sem ID.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${baseurl}/api/participants-has-challenges/active/${user.id}`
        );

        const data = response.data;

        console.log("🔍 Resposta da API:", data);

        // Se a API retorna um array, procura a carta ativa
        let cartaAtiva = null;

        if (Array.isArray(data)) {
          cartaAtiva = data.find((c) => c.completed_date === null);
        } else if (data && typeof data === "object" && data.completed_date === null) {
          cartaAtiva = data;
        }

        setCarta(cartaAtiva || null);
      } catch (error) {
        setCarta(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCartaAtiva();
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
        <Shake />
      </View>
    );
  }

  return (
    <CartaSelecionada2
      carta={carta}
      userId={user.id}
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
