// components/esperaShake.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function EsperaShake() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        ⏳ Já queres fazer outro? Infelizmente terás de aguardar. Um novo desafio estará disponível em breve.
      </Text>
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
  text: {
    color: "#263A83",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
});
