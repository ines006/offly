import React, { useEffect, useRef, useState, useContext } from "react";
import { BackHandler, View, Text, StyleSheet, TouchableOpacity, Image, AccessibilityInfo } from "react-native";
import { useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import axios from "axios";
import { TittlePagina } from "../../styles/styles";
import { AuthContext } from "../entrar/AuthContext";
import { baseurl } from "../../api-config/apiConfig"; 

export default function Shake() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const scaleAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  const distributeOffset1 = useSharedValue(0);
  const distributeOffset2 = useSharedValue(0);
  const distributeOffset3 = useSharedValue(0);
  const shakeCount = useRef(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const shakeAnimation = useSharedValue(0);
  const [cards, setCards] = useState([]);

  const fetchChallenges = async () => {
    if (!user?.id) {
      console.warn("❌ Utilizador não autenticado.");
      return;
    }

    try {
      const url = `${baseurl}/api/shake/generate-challenges`;
      const response = await axios.post(url, { userId: user.id });
      setCards(response.data);
    } catch (error) {
      console.error("❌ Erro ao gerar desafios:", error);
    }
  };

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

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.abs(x) + Math.abs(y) + Math.abs(z);

      if (totalForce > 4) {
        shakeCount.current += 1;

        if (shakeCount.current >= 5 && !isNavigating) {
          triggerCardAnimation(subscription);
        }
      }
    });

    Accelerometer.setUpdateInterval(100);

    return () => subscription.remove();
  }, [isNavigating]);

  const triggerCardAnimation = async (subscription) => {
    setIsNavigating(true);
    subscription?.remove();
    AccessibilityInfo.announceForAccessibility("O Shake foi feito");

    // 1. Chamar o backend para gerar desafios com base no ChatGPT
    await fetchChallenges();

    // 2. Animações após receber desafios
    rotateAnimation.value = withTiming(360, { duration: 1000, easing: Easing.out(Easing.ease) }, () => {
      rotateAnimation.value = 0;
    });

    scaleAnimation.value = withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.ease) }, () => {
      distributeOffset1.value = withTiming(-150, { duration: 1500, easing: Easing.out(Easing.ease) });
      distributeOffset2.value = withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) });
      distributeOffset3.value = withTiming(150, { duration: 1500, easing: Easing.out(Easing.ease) });

      scaleAnimation.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }, () => {
        runOnJS(navigateToCards)();
      });
    });
  };

  const navigateToCards = () => {
    router.push("../shake/cartas");
  };

  const combinedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeAnimation.value },
      { scale: scaleAnimation.value },
      { rotate: `${rotateAnimation.value}deg` },
    ],
  }));

  const animatedDistributedStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: distributeOffset1.value },
      { translateY: distributeOffset1.value ? -200 : 0 },
    ],
    opacity: distributeOffset1.value ? 1 : 0,
  }));

  const animatedDistributedStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: distributeOffset2.value },
      { translateY: distributeOffset2.value ? -200 : 0 },
    ],
    opacity: distributeOffset2.value ? 1 : 0,
  }));

  const animatedDistributedStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateX: distributeOffset3.value },
      { translateY: distributeOffset3.value ? -200 : 0 },
    ],
    opacity: distributeOffset3.value ? 1 : 0,
  }));

  return (
    <View style={styles.background}>
      <View
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel="Título: Shake"
      >
        <TittlePagina> Shake </TittlePagina>
      </View>
      <View style={styles.container}>
        <Animated.View style={[styles.card, combinedStyle]}>
          {cards[0]?.img ? (
            <Image
              accessibilityLabel="Imagem da carta principal"
              source={{ uri: cards[0].img }}
              style={{ width: "100%", height: "100%", borderRadius: 15 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.cardText}>OFFLY SHAKE ME</Text>
          )}
        </Animated.View>

        <Animated.View style={[styles.smallCard, animatedDistributedStyle1]}>
          {cards[0]?.img ? (
            <Image source={{ uri: cards[0].img }} style={styles.smallImage} resizeMode="cover" />
          ) : (
            <Text style={styles.cardText}>Carta 1</Text>
          )}
        </Animated.View>

        <Animated.View style={[styles.smallCard, animatedDistributedStyle2]}>
          {cards[1]?.img ? (
            <Image source={{ uri: cards[1].img }} style={styles.smallImage} resizeMode="cover" />
          ) : (
            <Text style={styles.cardText}>Carta 2</Text>
          )}
        </Animated.View>

        <Animated.View style={[styles.smallCard, animatedDistributedStyle3]}>
          {cards[2]?.img ? (
            <Image source={{ uri: cards[2].img }} style={styles.smallImage} resizeMode="cover" />
          ) : (
            <Text style={styles.cardText}>Carta 3</Text>
          )}
        </Animated.View>

        <Text style={styles.description}>Abana o telemóvel</Text>
        <Text style={styles.description2}>descobre o desafio do dia</Text>

        <TouchableOpacity style={styles.shakeButton} onPress={() => triggerCardAnimation()}>
          <Text style={styles.shakeButtonText}>Fazer Shake</Text>
        </TouchableOpacity>
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
  card: {
    width: 200,
    height: 320,
    backgroundColor: "#2E3A8C",
    borderRadius: 15,
    borderColor: "white",
    borderWidth: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  smallCard: {
    width: 100,
    height: 150,
    backgroundColor: "#2E3A8C",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    overflow: "hidden",
  },
  smallImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  cardText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    marginTop: 40,
    fontSize: 16,
    fontWeight: "bold",
    color: "#4C4B49",
    textAlign: "center",
  },
  description2: {
    fontSize: 13,
    color: "#4C4B49",
    textAlign: "center",
  },
  shakeButton: {
    marginTop: 40,
    backgroundColor: "#2E3A8C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  shakeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
