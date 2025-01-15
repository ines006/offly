import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi"; 

export default function CartaSelecionada() {
  const router = useRouter();
  const { card, cardNumber } = useLocalSearchParams();
  const [selectedCard, setSelectedCard] = useState(JSON.parse(card)); 

  const handleValidate = async () => {
    try {
      if (selectedCard.id) {
        const cardRef = doc(db, "cartas", selectedCard.id); 
        await updateDoc(cardRef, { validada: true }); 

        setSelectedCard({ ...selectedCard, validada: true }); 
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

        {/* Botão para ir para a homepage */}
        <TouchableOpacity style={styles.homeButton} onPress={() => router.push("/")}>
          <Text style={styles.homeButtonText}>X</Text>
        </TouchableOpacity>

        {/* Título */}
        <Text style={styles.title}>Escolheste a carta {cardNumber}</Text>
        <Text style={styles.mainDescription2}>Já fizeste o teu shake do dia. Comprova com uma fotografia a realização do teu desafio</Text>

        {/* Carta Selecionada */}
        <View style={[styles.mainCard, { marginTop: 20 }]}>
          {selectedCard.imagem && (
            <Image
              source={{ uri: selectedCard.imagem }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.cardContent}>
            <Text style={styles.mainTitle}>{selectedCard.titulo}</Text>
            <Text style={styles.mainDescription}>{selectedCard.carta}</Text>
          </View>
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
  homeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#263A83",
    justifyContent: "center", 
    alignItems: "center",    
  },
  homeButtonText: {
    color: "#263A83", 
    fontSize: 30,
    alignItems: "center"
  },
  backButtonText: {
    color: "#263A83", 
    fontSize: 30,
    alignItems: "center",
    marginTop: -4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263A83",
    textAlign: "center",
    marginVertical: 20,
    backgroundColor: "white",
    padding: 13,
    borderRadius: 12,
  },
  mainCard: {
    width: 210,
    height: 360,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between", 
    padding: 10,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 230,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardContent: {
    flex: 1, 
    justifyContent: "center",
    alignItems: "center", 
  },
  mainTitle: {
    color: "#2E3A8C",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  mainDescription: {
    color: "#2E3A8C",
    fontSize: 12,
    textAlign: "center",
  },
  mainDescription2: {
    color: "#2E3A8C",
    fontSize: 14,
    textAlign: "center",
    paddingRight: 60,
    paddingLeft: 60,
  },
  validateButton: {
    marginTop: 40,
    backgroundColor: "#2E3A8C",
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
