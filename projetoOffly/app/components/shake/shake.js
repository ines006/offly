import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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

export default function Shake() {
  const router = useRouter();
  const scaleAnimation = useSharedValue(1); // Escala da carta principal
  const rotateAnimation = useSharedValue(0); // Rotação da carta principal
  const distributeOffset1 = useSharedValue(0); // Posição da primeira carta
  const distributeOffset2 = useSharedValue(0); // Posição da segunda carta
  const distributeOffset3 = useSharedValue(0); // Posição da terceira carta
  const shakeCount = useRef(0); // Contador de movimentos
  const [isNavigating, setIsNavigating] = useState(false);
  const shakeAnimation = useSharedValue(0);

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
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.abs(x) + Math.abs(y) + Math.abs(z);

      if (totalForce > 2) {
        shakeCount.current += 1;

        if (shakeCount.current >= 5 && !isNavigating) {
          triggerCardAnimation(subscription);
        }
      }
    });

    Accelerometer.setUpdateInterval(100);

    return () => subscription.remove();
  }, [isNavigating]);

  const triggerCardAnimation = (subscription) => {
    setIsNavigating(true);
    subscription?.remove();

    // Animação de rotação e escala da carta principal
    rotateAnimation.value = withTiming(360, { duration: 1000, easing: Easing.out(Easing.ease) }, () => {
      rotateAnimation.value = 0; // Reseta rotação para próximo uso
    });

    scaleAnimation.value = withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.ease) }, () => {
      // Após a rotação e escala, distribui as cartas
      distributeOffset1.value = withTiming(-150, { duration: 1500, easing: Easing.out(Easing.ease) }); // Carta 1
      distributeOffset2.value = withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }); // Carta 2
      distributeOffset3.value = withTiming(150, { duration: 1500, easing: Easing.out(Easing.ease) }); // Carta 3

      // Retorna a escala normal e navega
      scaleAnimation.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }, () => {
        runOnJS(navigateToCards)();
      });
    });
  };

  const navigateToCards = () => {
    router.push("./cartas");
  };

  const animatedMainCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnimation.value },
      { rotate: `${rotateAnimation.value}deg` }, // Rotação em graus
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

  const combinedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeAnimation.value }, // Animação de abanar
      { scale: scaleAnimation.value }, // Escala da carta
      { rotate: `${rotateAnimation.value}deg` }, // Rotação da carta
    ],
  }));

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        {/* Carta principal */}
        <Animated.View style={[styles.card, combinedStyle]}>
          <Text style={styles.cardText}>OFFLY SHAKE ME</Text>
        </Animated.View>

        {/* Cartas distribuídas */}
        <Animated.View style={[styles.smallCard, animatedDistributedStyle1]}>
          <Text style={styles.cardText}>Carta 1</Text>
        </Animated.View>
        <Animated.View style={[styles.smallCard, animatedDistributedStyle2]}>
          <Text style={styles.cardText}>Carta 2</Text>
        </Animated.View>
        <Animated.View style={[styles.smallCard, animatedDistributedStyle3]}>
          <Text style={styles.cardText}>Carta 3</Text>
        </Animated.View>

        {/* Texto e botão */}
        <Text style={styles.description}>
          Abana o telemóvel para descobrir o desafio do dia
        </Text>

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
    height: 300,
    backgroundColor: "#2E3A8C",
    borderRadius: 15,
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
  },
  cardText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    marginTop: 20,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  shakeButton: {
    marginTop: 20,
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
