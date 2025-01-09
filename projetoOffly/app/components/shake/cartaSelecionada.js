import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi";
import Icon from "react-native-vector-icons/Ionicons";

export default function CartaSelecionada() {
  const router = useRouter();
  const { card, cardNumber } = useLocalSearchParams();
  const [selectedCard, setSelectedCard] = useState(() => JSON.parse(card));
  const [timeLeft, setTimeLeft] = useState(null);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    const initializeTimer = async () => {
      try {
        const cardRef = doc(db, "cartas", selectedCard.id);
        const cardSnapshot = await getDoc(cardRef);

        if (cardSnapshot.exists()) {
          const data = cardSnapshot.data();
          if (data.validada) {
            setIsValidated(true);
            setTimeLeft(0);
            return;
          }

          if (data.timerStart) {
            const now = new Date().getTime();
            const timeElapsed = now - data.timerStart;
            const timeRemaining = 24 * 60 * 60 * 1000 - timeElapsed;

            setTimeLeft(timeRemaining > 0 ? timeRemaining : 0);
          } else {
            const now = new Date().getTime();
            await updateDoc(cardRef, { timerStart: now });
            setTimeLeft(24 * 60 * 60 * 1000);
          }
        } else {
          Alert.alert("Erro", "Carta não encontrada no banco de dados!");
        }
      } catch (error) {
        console.error("Erro ao inicializar o timer:", error);
        Alert.alert("Erro", "Não foi possível inicializar o timer.");
      }
    };

    initializeTimer();
  }, [selectedCard]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(prev - 1000, 0));
      }, 1000);
    } else if (timeLeft === 0 && !isValidated) {
      Alert.alert("Tempo Esgotado", "O tempo para validar esta carta acabou.");
    }

    return () => clearInterval(timer);
  }, [timeLeft, isValidated]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleValidate = async () => {
    try {
      const cardRef = doc(db, "cartas", selectedCard.id);
      await updateDoc(cardRef, { validada: true });

      setIsValidated(true);
      setTimeLeft(0); // O timer é zerado após validação.
      Alert.alert("Sucesso", "A carta foi validada com sucesso!");
    } catch (error) {
      console.error("Erro ao validar a carta:", error);
      Alert.alert("Erro", "Não foi possível validar a carta.");
    }
  };

  const handleSaveCard = async () => {
    const userId = "id_do_utilizador"; // Substitua pelo ID real do utilizador (exemplo: Firebase Auth)
    try {
      const userSelectionsRef = doc(db, "selecoes", userId);
      await setDoc(userSelectionsRef, { selectedCard }, { merge: true });
      Alert.alert("Sucesso", "A carta foi salva com sucesso no Firestore!");
    } catch (error) {
      console.error("Erro ao salvar a carta no Firestore:", error);
      Alert.alert("Erro", "Não foi possível salvar a carta no Firestore.");
    }
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>&lt;</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={() => router.push("../navbar")}>
          <Text style={styles.homeButtonText}>X</Text>
        </TouchableOpacity>

        {timeLeft !== null && timeLeft > 0 && (
          <View style={styles.timerContainer}>
            <Icon name="time-outline" size={24} color="#263A83" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        )}

        {isValidated && (
          <Text style={styles.validationMessage}>Esta carta já foi validada!</Text>
        )}

        <Text style={styles.title}>Escolheste a carta {cardNumber}</Text>

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

        {!isValidated && (
          <TouchableOpacity style={styles.validateButton} onPress={handleValidate}>
            <Text style={styles.validateButtonText}>Validar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveCard}>
          <Text style={styles.saveButtonText}>Salvar Carta</Text>
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
    alignItems: "center",
  },
  backButtonText: {
    color: "#263A83",
    fontSize: 30,
    alignItems: "center",
    marginTop: -4,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#E3FC87",
    padding: 13,
    borderRadius: 20,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#263A83",
  },
  validationMessage: {
    fontSize: 16,
    color: "#2E3A8C",
    marginVertical: 10,
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
  validateButton: {
    marginTop: 20,
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
  saveButton: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
