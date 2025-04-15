// app/index.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Login from "./components/entrar/login";
import OfflyScreen from "./OfflyScreen";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false); // após 3s, troca para o login
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {showSplash ? <OfflyScreen /> : <Login />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#263330", // mesmo fundo da splash
  },
});
