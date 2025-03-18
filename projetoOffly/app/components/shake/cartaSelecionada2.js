import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function CartaSelecionada2({ userId, carta, onValidated }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeTimer = async () => {
      try {
        // Referência ao documento da carta no Firestore
        const cartaRef = doc(db, "users", userId, "cartas", carta.id);
        const cartaSnapshot = await getDoc(cartaRef);

        if (cartaSnapshot.exists()) {
          const data = cartaSnapshot.data();

          // Verifica se a carta já foi validada
          if (data.validada) {
            setIsValidated(true);
            setTimeLeft(0);
          } else if (data.timerStart) {
            // Calcula o tempo restante com base no timerStart
            const now = new Date().getTime();
            const timeElapsed = now - data.timerStart;
            const timeRemaining = 24 * 60 * 60 * 1000 - timeElapsed;

            setTimeLeft(timeRemaining > 0 ? timeRemaining : 0);
          } else {
            Alert.alert("Erro", "O timer não foi encontrado para esta carta.");
          }
        } else {
          Alert.alert("Erro", "Carta não encontrada no banco de dados!");
        }
      } catch (error) {
        console.error("Erro ao inicializar o timer:", error);
        Alert.alert("Erro", "Não foi possível inicializar o timer.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeTimer();
  }, [carta, userId]);

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E3A8C" />
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        {timeLeft !== null && timeLeft > 0 && (
          <View style={styles.timerContainer}>
            <Icon name="time-outline" size={24} color="#263A83" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        )}

        <View style={styles.mainCard}>
          {carta.imagem && (
            <Image
              accessibilityLabel="Imagem da carta do desafio diário"
              source={{ uri: carta.imagem }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.cardContent}>
            <Text style={styles.mainTitle}>{carta.titulo}</Text>
            <Text style={styles.mainDescription}>{carta.carta}</Text>
          </View>
        </View>

        {!isValidated ? (
          <TouchableOpacity
            style={styles.validateButton}
            onPress={() => router.push("../shake/uploadDesafio")}
          >
            <Text style={styles.validateButtonText}>Comprova o teu desafio</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.validationMessage}>Esta carta já foi validada!</Text>
        )}
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#BFE0FF",
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
});
