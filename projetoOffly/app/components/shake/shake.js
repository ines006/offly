import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi";
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
import { TittlePagina } from "../../styles/styles";
import { AccessibilityInfo, BackHandler } from "react-native";

export default function Shake() {
  const router = useRouter();
  const scaleAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  const distributeOffset1 = useSharedValue(0);
  const distributeOffset2 = useSharedValue(0);
  const distributeOffset3 = useSharedValue(0);
  const shakeCount = useRef(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const shakeAnimation = useSharedValue(0);
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {
    // Fetch image from Firestore
    const fetchImage = async () => {
      try {
        const docRef = doc(db, "shakecarta", "shake");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setImageURL(data.imagem); 
        } else {
          console.error("Documento não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar a imagem:", error);
      }
    };

    fetchImage();
  }, []);

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

      if (totalForce > 1) {
        shakeCount.current += 1;

        if (shakeCount.current >= 5 && !isNavigating) {
          triggerCardAnimation(subscription);
        }
      }
    });

    Accelerometer.setUpdateInterval(100);

    return () => {
      subscription.remove();
      backHandler.remove();
    };
  }, [isNavigating]);

  const triggerCardAnimation = (subscription) => {
    setIsNavigating(true);
    subscription?.remove();

    AccessibilityInfo.announceForAccessibility("O Shake foi feito");

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

  const animatedMainCardStyle = useAnimatedStyle(() => ({
    transform: [
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

  const combinedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeAnimation.value },
      { scale: scaleAnimation.value },
      { rotate: `${rotateAnimation.value}deg` },
    ],
  }));

  return (
    <View style={styles.background}>
      <View accessible={true} accessibilityRole="header" accessibilityLabel="Título: Shake">
            <TittlePagina accessible={true} accessibilityRole="header" accessibilityLabel="Título: Shake"> Shake </TittlePagina>
          </View>
      <View style={styles.container}>
        {/* Carta principal */}
        <Animated.View style={[styles.card, combinedStyle]}>
          {imageURL ? (
            <Image
              accessibilityLabel="Imagem de ilustração da carta de shake"
              source={{ uri: imageURL }}
              style={{ width: "100%", height: "100%", borderRadius: 15 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.cardText}>OFFLY SHAKE ME</Text>
          )}
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
          Abana o telemóvel
        </Text>
        <Text style={styles.description2}>
          descobre o desafio do dia
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
