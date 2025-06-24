import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AccessibilityInfo,
  Modal,
  Dimensions,
} from "react-native";
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

const { width, height } = Dimensions.get("window");

export default function Descobrir() {
  const router = useRouter();
  const { user, accessToken } = useContext(AuthContext);
  const [teamId, setTeamId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const shakeCount = useRef(0);

  const shakeAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  const loadingRotate = useSharedValue(0);

  // Shake card idle animation
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

  // Fetch team ID
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
        setTeamId(response.data.teams_id);
      } catch (error) {
        console.error("❌ Erro ao buscar dados do utilizador:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados do utilizador.");
      }
    };

    fetchUserData();
  }, [user]);

  const triggerAnimation = () => {
    if (isLoading) return;
    setIsLoading(true);
    setIsNavigating(true);
    AccessibilityInfo.announceForAccessibility("O Shake foi feito");

    // Start loading animation
    loadingRotate.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

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

      if (response.data.success) {
        router.push(`../desafio/desafioSemanal?teamId=${teamId}`);
      } else {
        Alert.alert("Erro", response.data.message || "Erro desconhecido.");
      }
    } catch (err) {
      console.error("❌ Erro ao descobrir desafio:", err);
      Alert.alert("Erro", "Não foi possível processar o desafio.");
    } finally {
      setIsLoading(false);
      setIsNavigating(false);
      shakeCount.current = 0;
      loadingRotate.value = 0;
    }
  };

  const animatedMainCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeAnimation.value },
      { scale: scaleAnimation.value },
      { rotate: `${rotateAnimation.value}deg` },
    ],
  }));

  const animatedLoadingStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${loadingRotate.value}deg` },
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

      {/* Modal de carregamento */}
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Animated.Image
              source={shakeMeSemanal}
              style={[styles.loadingCard, animatedLoadingStyle]}
              resizeMode="contain"
            />
            <Text style={styles.modalText}>A gerar desafio semanal...</Text>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: width * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  loadingCard: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
});


