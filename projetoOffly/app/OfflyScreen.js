import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";

export default function OfflyScreen() {
  const [logoScaleAnim] = useState(new Animated.Value(0)); // Animação do logo
  const [textScaleAnim] = useState(new Animated.Value(0)); // Animação do texto

  useEffect(() => {
    // Animação do logo
    Animated.timing(logoScaleAnim, {
      toValue: 1, // O logo vai crescer até o tamanho normal
      duration: 1500, // Duração de 1.5 segundos
      useNativeDriver: true,
    }).start();

    // Animação do texto (aparece um pouco depois do logo)
    Animated.timing(textScaleAnim, {
      toValue: 1, // O texto vai crescer até o tamanho normal
      duration: 1500, // Duração de 1.5 segundos
      delay: 300, // Atraso de 0.3 segundos para o texto aparecer depois do logo
      useNativeDriver: true,
    }).start();
  }, [logoScaleAnim, textScaleAnim]);

  return (
    <View style={styles.card}>
      <Animated.Image
        source={require("../assets/images/logoo.png")}
        style={[styles.logo, { transform: [{ scale: logoScaleAnim }] }]} // Animação do logo
      />
      <Animated.Text
        style={[
          styles.title,
          { transform: [{ scale: textScaleAnim }] }, // Animação do texto
        ]}
      >
        OFFLY
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 600,
    backgroundColor: "#283B8B",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain", // mantém proporções
  },
  title: {
    color: "#A7C8FF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
});
