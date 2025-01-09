import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi"; // Certifique-se de que o caminho está correto

export default function CartaSelecionada() {
  const router = useRouter();
  const { card, cardNumber } = useLocalSearchParams();
  const [selectedCard, setSelectedCard] = useState(JSON.parse(card)); // Estado para a carta selecionada

  // Função para validar a carta
  const handleValidate = async () => {
    try {
      if (selectedCard.id) {
        const cardRef = doc(db, "cartas", selectedCard.id); // Referência ao documento da carta
        await updateDoc(cardRef, { validada: true }); // Adiciona o campo 'validada' com valor true

        setSelectedCard({ ...selectedCard, validada: true }); // Atualiza o estado local da carta
        Alert.alert("Sucesso", "A carta foi validada com sucesso!", [
          { text: "OK", onPress: () => console.log("Carta validada") },
        ]);
      } else {
        Alert.alert("Erro", "ID da carta não encontrado!");
      }
    } catch (error) {
      console.error("Erro ao validar a carta:", error);
      Alert.alert("Erro", "Não foi possível validar a carta.");
    }
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        {/* Botão de voltar */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>&lt;</Text>
        </TouchableOpacity>

        {/* Título */}
        <Text style={styles.title}>Carta Selecionada Número {cardNumber}</Text>

        {/* Carta */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{selectedCard.titulo}</Text>
          <Text style={styles.cardContent}>{selectedCard.carta}</Text>
        </View>

        {/* Botão Validar */}
        <TouchableOpacity style={styles.validateButton} onPress={handleValidate}>
          <Text style={styles.validateButtonText}>Validar</Text>
        </TouchableOpacity>
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
  validatedText: {
    color: "#4CAF50",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
  validateButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  validateButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
