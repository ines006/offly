import React, { useState, useContext, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, AccessibilityInfo } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Accelerometer } from "expo-sensors";
import axios from "axios";
import { AuthContext } from "../../components/entrar/AuthContext";
import { baseurl } from "../../api-config/apiConfig";
import shakeMeSemanal from "../../imagens/shakeMeSemanal.png"; 

export default function Descobrir() {
  const router = useRouter();
  const { user, accessToken } = useContext(AuthContext);
  const [teamId, setTeamId] = useState("");
  const scaleAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  const shakeAnimation = useSharedValue(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const shakeCount = useRef(0);

  // Shake animation (abanar carta suavemente)
  useEffect(() => {
    shakeAnimation.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
        withDelay(2000, withTiming(0, { duration: 0 }))
      ),
      -1,
      false
    );
  }, []);

  // Shake detector
  useEffect(() => {
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.abs(x) + Math.abs(y) + Math.abs(z);
      if (totalForce > 4) {
        shakeCount.current += 1;

        if (shakeCount.current >= 5 && !isNavigating && !isLoading) {
          triggerAnimation();
        }
      }
    });

    Accelerometer.setUpdateInterval(100);

    return () => subscription.remove();
  }, [isNavigating, isLoading]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${baseurl}/participants/${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        const userData = response.data;
        setTeamId(userData.teams_id);
      } catch (error) {
        console.error("❌ Erro ao buscar dados do utilizador:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        Alert.alert(
          "Erro",
          error.response?.data?.message ||
            "Não foi possível carregar os dados do utilizador."
        );
      }
    };

    fetchUserData();
  }, [user]);

  const triggerAnimation = () => {
    if (isLoading) return;
    setIsLoading(true);
    setIsNavigating(true);
    AccessibilityInfo.announceForAccessibility("O Shake foi feito");

    rotateAnimation.value = withTiming(360, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    }, () => {
      rotateAnimation.value = 0;
    });

    scaleAnimation.value = withTiming(1.5, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    }, () => {
      scaleAnimation.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      }, () => {
        runOnJS(handleDiscover)();
      });
    });
  };

  const handleDiscover = async () => {
    try {
      const response = await axios.post(`${baseurl}/api/shakeSemanal/discover-weekly`, {
        userId: user.id,
      });
      console.log("🔗 POST para", `${baseurl}/api/shakeSemanal/discover-weekly`);

      if (response.data.success) {
        router.push(`../desafio/desafioSemanal?teamId=${teamId}`);
      } else {
        Alert.alert("Erro", response.data.message || "Erro desconhecido.");
      }
    } catch (err) {
        console.error("❌ Erro ao descobrir desafio:", err);
        if (err.response) {
          console.error("📡 Status:", err.response.status);
          console.error("🧾 Data:", err.response.data);
        } else if (err.request) {
          console.error("📡 Request feito mas sem resposta:", err.request);
        } else {
          console.error("❌ Erro desconhecido:", err.message);
        }
        Alert.alert("Erro", "Não foi possível processar o desafio.");
      } finally {
            setIsLoading(false);
            setIsNavigating(false);
            shakeCount.current = 0;
          }
        };

  const animatedMainCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeAnimation.value },
      { scale: scaleAnimation.value },
      { rotate: `${rotateAnimation.value}deg` },
    ],
  }));

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Animated.Image
          source={shakeMeSemanal}
          style={[styles.cardImage, animatedMainCardStyle]}
          resizeMode="contain"
          accessibilityLabel="Carta para descobrir o desafio semanal"
        />

        <Text style={styles.description}>
          Descobre o desafio semanal que vais fazer em equipa.
        </Text>

        <TouchableOpacity
          style={styles.discoverButton}
          onPress={triggerAnimation}
          disabled={isLoading}
        >
          <Text style={styles.discoverButtonText}>
            {isLoading ? "Carregando..." : "Descobrir"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: 200,
    height: 310,
    borderRadius: 15,
    borderColor: "#263A83",
    borderWidth: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  description: {
    marginTop: 40,
    fontSize: 16,
    fontWeight: "bold",
    color: "#4C4B49",
    textAlign: "center",
  },
  discoverButton: {
    marginTop: 40,
    backgroundColor: "#E3FC87",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  discoverButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
});


