import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseApi";
import Icon from "react-native-vector-icons/Ionicons";
import { Svg, Circle, Path, G } from "react-native-svg";

export default function CartaSelecionada() {
  const router = useRouter();
  const { card, cardNumber } = useLocalSearchParams();
  const [selectedCard, setSelectedCard] = useState(() => JSON.parse(card));
  const [timeLeft, setTimeLeft] = useState(null);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    const initializeTimer = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert("Erro", "Usuário não autenticado.");
          return;
        }

        const cardRef = doc(db, "users", user.uid, "cartas", selectedCard.id);
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

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Botão voltar atrás"
        >
          <Text style={styles.backButtonText}>
            <Svg width={36} height={35} viewBox="0 0 36 35" fill="none">
              <Circle
                cx="18.1351"
                cy="17.1713"
                r="16.0177"
                stroke="#263A83"
                strokeWidth={2}
              />
              <Path
                d="M21.4043 9.06396L13.1994 16.2432C12.7441 16.6416 12.7441 17.3499 13.1994 17.7483L21.4043 24.9275"
                stroke="#263A83"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("../navbar")}
          accessibilityLabel="Botão fechar"
        >
          <Text style={styles.homeButtonText}>
            <Svg
              width="800px"
              height="800px"
              viewBox="0 0 21 21"
              xmlns="http://www.w3.org/2000/svg"
            >
              <G
                fill="none"
                fill-rule="evenodd"
                stroke="#263A83"
                stroke-linecap="round"
                stroke-linejoin="round"
                transform="translate(2 2)"
              >
                <Circle cx="8.5" cy="8.5" r="8" />

                <G transform="matrix(0 1 -1 0 17 0)">
                  <Path d="m5.5 11.5 6-6" />

                  <Path d="m5.5 5.5 6 6" />
                </G>
              </G>
            </Svg>
          </Text>
        </TouchableOpacity>

        {timeLeft !== null && timeLeft > 0 && (
          <View style={styles.timerContainer}>
            <Icon name="time-outline" size={24} color="#263A83" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        )}

        {isValidated && (
          <Text style={styles.validationMessage}>
            Esta carta já foi validada!
          </Text>
        )}

        <Text style={styles.title}>Escolheste a carta {cardNumber}</Text>

        <View accessible={true} style={[styles.mainCard, { marginTop: 20 }]}>
          {selectedCard.imagem && (
            <Image
              accessibilityLabel="Imagem da carta escolhida"
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
          <TouchableOpacity
            style={styles.validateButton}
            onPress={() => router.push("./uploadDesafio")}
          >
            <Text style={styles.validateButtonText}>Comprova o teu desafio</Text>
          </TouchableOpacity>
        )}
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
    marginTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 40,
    width: 40,
    height: 40,
    left: 25,
    borderRadius: 25,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  homeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    justifyContent: "center",
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
});
