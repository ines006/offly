import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
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

export default function WeeklyChallenge() {
  const router = useRouter();
  const scaleAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {
   
    const fetchImage = async () => {
      try {
        const docRef = doc(db, "shakecarta", "shakeDesafio");
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

  const triggerAnimation = () => {
    setIsNavigating(true);

    rotateAnimation.value = withTiming(360, { duration: 1000, easing: Easing.out(Easing.ease) }, () => {
      rotateAnimation.value = 0;
    });

    scaleAnimation.value = withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.ease) }, () => {
      scaleAnimation.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }, () => {
        runOnJS(navigateToWeeklyChallenge)();
      });
    });
  };

  const navigateToWeeklyChallenge = () => {
    router.push("../weekly/challenge");
  };

  const animatedMainCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnimation.value },
      { rotate: `${rotateAnimation.value}deg` },
    ],
  }));

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        {/* Carta principal */}
        <Animated.View style={[styles.card, animatedMainCardStyle]}>
          {imageURL ? (
            <Image
              source={{ uri: imageURL }}
              style={{ width: "100%", height: "100%", borderRadius: 9 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.cardText}>Descobre o desafio semanal</Text>
          )}
        </Animated.View>

        {/* Texto e botão */}
        <Text style={styles.description}>
          Descobre o desafio semanal que vais fazer em equipa.
        </Text>

        <TouchableOpacity style={styles.discoverButton} onPress={triggerAnimation}>
          <Text style={styles.discoverButtonText}>Descobrir</Text>
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
  card: {
    width: 200,
    height: 320,
    borderRadius: 15,
    borderColor: "#263A83",
    borderWidth: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  cardText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
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
