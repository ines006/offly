import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartaSelecionada() {
  const router = useRouter();
  const { card, cardNumber } = useLocalSearchParams(); 
  const selectedCard = JSON.parse(card); 

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>&lt;</Text>
        </TouchableOpacity>

       
        <Text style={styles.title}>Carta Selecionada Número {cardNumber}</Text>

        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{selectedCard.titulo}</Text>
          <Text style={styles.cardContent}>{selectedCard.carta}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: "#BFE0FF", 
  },
  container: {
    flex: 1,
    justifyContent: "center", 
    alignItems: "center", 
  },
  backButton: {
    position: "absolute",
    top: 40, 
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent", 
    borderWidth: 2, 
    borderColor: "#263A83", 
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#263A83", 
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263A83",
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    width: 200,
    height: 300,
    backgroundColor: "#FFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardTitle: {
    color: "#263A83",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardContent: {
    color: "#263A83",
    fontSize: 16,
    textAlign: "center",
  },
});
