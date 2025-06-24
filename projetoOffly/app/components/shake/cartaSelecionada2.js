import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { Svg, Circle, Path, G } from "react-native-svg";
import { AuthContext } from "../entrar/AuthContext";
import axios from "axios";
import { baseurl } from "../../api-config/apiConfig";

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function CartaSelecionada() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [selectedCard, setSelectedCard] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchCarta = async () => {
      try {
        console.log("Utilizador autenticado:", user);
        const response = await axios.get(
          `${baseurl}/api/participants-has-challenges/active/${user.id}`
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
  } else if (timeLeft === 0 && selectedCard) {
    Alert.alert("Tempo Esgotado", "O tempo para validar esta carta acabou.");

    const updateValidation = async () => {
      try {
        await axios.put(`${baseurl}/api/shake/validate-time/${user.id}/${selectedCard.challenge.id}`);
        console.log("✅ Validação marcada automaticamente.");
      } catch (err) {
      }
    };

    updateValidation();
  }

  return () => clearInterval(timer);
}, [timeLeft, selectedCard]);

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
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
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("../navbar")}
        >
          <Svg width="40px" height="800px" viewBox="0 0 21 21">
            <G
              fill="none"
              stroke="#263A83"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(2 2)"
            >
              <Circle cx="8.5" cy="8.5" r="8" />
              <G transform="matrix(0 1 -1 0 17 0)">
                <Path d="m5.5 11.5 6-6" />
                <Path d="m5.5 5.5 6 6" />
              </G>
            </G>
          </Svg>
        </TouchableOpacity> */}

        {selectedCard ? (
          <>
            {timeLeft !== null && (
              <View style={styles.timerContainer}>
                <Icon name="time-outline" size={24} color="#263A83" />
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>
            )}
            

            <View style={styles.cardWrapper}>
              <View style={styles.imageContainer}>
                <Image
                  accessibilityLabel="Imagem da carta selecionada"
                  source={{ uri: selectedCard.challenge.imagem_nivel }}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.mainCard}>
                <View style={styles.cardContent}>
                  <Text style={styles.mainTitle}>
                    {selectedCard.challenge?.titulo}
                  </Text>
                  <Text style={styles.mainDescription}>
                    {selectedCard.challenge?.carta}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.validateButton}
              onPress={() => router.push("../shake/uploadDesafio")}
            >
              <Text style={styles.validateButtonText}>
                Comprova o teu desafio
              </Text>
            </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 100,
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
    marginTop: -40,
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
    // marginVertical: 20,
    backgroundColor: "white",
    padding: 13,
    borderRadius: 12,
  },
  cardWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  mainCard: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 60, // espaço para a imagem sobrepor
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  cardImage: {
    width: "100%",
    height: 120,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 5,
    paddingHorizontal: 4,
  },
  mainTitle: {
    color: '#263A83',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  mainDescription: {
    color: '#263A83',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
    
    alignSelf: 'stretch',
  },
  validateButton: {
    marginTop: 30,
    backgroundColor: '#2E3A8C',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 14,
    alignSelf: 'center',
    marginBottom: 10,
    width: '80%',
  },
  validateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
