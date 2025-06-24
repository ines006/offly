import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { Svg, Circle, Path, G } from "react-native-svg";
import { AuthContext } from "../entrar/AuthContext";
import axios from "axios";
import { baseurl } from "../../api-config/apiConfig";

// Formatar tempo com horas, minutos e segundos
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}

export default function EsperaShake() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [selectedCard, setSelectedCard] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [imageIndex, setImageIndex] = useState(0); 

  const imageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchCarta = async () => {
      try {
        const response = await axios.get(
          `${baseurl}/api/participants-has-challenges/active-with-image/${user.id}`
        );

        const data = response.data;

        if (data) {
          setSelectedCard(data);
          const now = new Date();
          const startDate = new Date(data.starting_date);
          const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          const remaining = endDate - now;
          setTimeLeft(remaining > 0 ? remaining : 0);
        } else {
          Alert.alert("Erro", "Nenhuma carta ativa encontrada.");
        }
      } catch (error) {

      }
    };

    if (user?.id) {
      fetchCarta();
    }
  }, [user]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(prev - 1000, 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Alternar imagem com animação "shake-slide"
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(imageAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(imageAnim, {
          toValue: 15,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(imageAnim, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setImageIndex((prev) => (prev === 0 ? 1 : 0));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getImageUri = () => {
    const base64 = selectedCard?.user_img;
    if (!base64) return null;
    return base64.startsWith("data")
      ? base64
      : `data:image/jpeg;base64,${base64}`;
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        {/* Botão Voltar */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Svg width={36} height={35} viewBox="0 0 36 35" fill="none">
            <Circle cx="18.1351" cy="17.1713" r="16.0177" stroke="#263A83" strokeWidth={2} />
            <Path
              d="M21.4043 9.06396L13.1994 16.2432C12.7441 16.6416 12.7441 17.3499 13.1994 17.7483L21.4043 24.9275"
              stroke="#263A83"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Botão Home */}
        <TouchableOpacity style={styles.homeButton} onPress={() => router.push("../navbar")}>
          <Svg width="40px" height="800px" viewBox="0 0 21 21">
            <G fill="none" stroke="#263A83" strokeLinecap="round" strokeLinejoin="round" transform="translate(2 2)">
              <Circle cx="8.5" cy="8.5" r="8" />
              <G transform="matrix(0 1 -1 0 17 0)">
                <Path d="m5.5 11.5 6-6" />
                <Path d="m5.5 5.5 6 6" />
              </G>
            </G>
          </Svg>
        </TouchableOpacity>

        {/* Título */}
        <Text style={styles.pageTitle}>Tic Tac</Text>

        {selectedCard ? (
          <>
            {timeLeft !== null && (
              <View style={styles.timerContainer}>
                <Icon name="time-outline" size={20} color="#263A83" />
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>
            )}

            <View style={styles.circleBehindCard} />

            {/* Carta com animação */}
            <View style={styles.cardWrapper}>
              <View style={styles.mainCard}>
                <Animated.Image
                  accessibilityLabel="Imagem da carta ou do utilizador"
                  source={{
                    uri:
                      imageIndex === 0
                        ? selectedCard.challenge?.imagem_nivel
                        : getImageUri(),
                  }}
                  style={[
                    styles.cardImage,
                    { transform: [{ translateX: imageAnim }] },
                  ]}
                  resizeMode="cover"
                />
                <Text style={styles.mainTitle}>{selectedCard.challenge?.titulo}</Text>
                <Text style={styles.mainDescription}>{selectedCard.challenge?.carta}</Text>
              </View>
            </View>

            {/* Mensagem final */}
            <View style={styles.messageContainer}>
              <Text style={styles.messageTitle}>Já queres outro?</Text>
              <Text style={styles.messageSubtitle}>
                Falta pouco, um novo desafio te espera quando acabares de contar até 1000
              </Text>
            </View>
          </>
        ) : (
          <Text style={{ color: "#263A83", marginTop: 50 }}>
            Nenhuma carta ativa encontrada.
          </Text>
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
    alignItems: "center",
    marginTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 25,
    width: 40,
    height: 40,
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
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#263A83",
    marginTop: 20,
    marginBottom: 20,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3FC87",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#263A83",
  },
  circleBehindCard: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#D0F8C0",
    top: 250,
    zIndex: -1,
  },
  cardWrapper: {
    transform: [{ rotate: "-5deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    marginBottom: 30,
    top: 25,
  },
  mainCard: {
    width: 220,
    height: 340,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: 182,
    height: 190,
    borderRadius: 16,
    backgroundColor: "#FFF",
    marginBottom: 15,
  },
  mainTitle: {
    color: "#2E3A8C",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  mainDescription: {
    color: "#2E3A8C",
    fontSize: 12,
    textAlign: "center",
  },
  messageContainer: {
    paddingHorizontal: 30,
    marginTop: 20,
    alignItems: "center",
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: 8,
    textAlign: "center",
    top: 20,
  },
  messageSubtitle: {
    fontSize: 14,
    color: "#263A83",
    textAlign: "center",
    top: 20,
  },
});
