import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import OfflyScreen from "../app/OfflyScreen"

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false); // após 3s, troca para o login
      router.replace("../components/entrar/login"); // redireciona para a rota de login
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {showSplash && <OfflyScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d2e9ff", // mesmo fundo da splash
  },
});
