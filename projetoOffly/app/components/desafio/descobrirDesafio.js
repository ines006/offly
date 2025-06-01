import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import axios from "axios";
import { AuthContext } from "../../components/entrar/AuthContext";
import { baseurl } from "../../api-config/apiConfig";

export default function Descobrir() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const scaleAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  const [isLoading, setIsLoading] = useState(false);

  const triggerAnimation = () => {
    if (isLoading) return;
    setIsLoading(true);

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
      const response = await axios.post(`${baseurl}/api/discover-weekly-challenge`, {
        userId: user.id,
      });

      if (response.data.success) {
        router.push("../desafio/desafioSemanal");
      } else {
        Alert.alert("Erro", response.data.message || "Erro desconhecido.");
      }
    } catch (err) {
      console.error("Erro ao descobrir desafio:", err);
      Alert.alert("Erro", "Não foi possível processar o desafio.");
    } finally {
      setIsLoading(false);
    }
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
        <Animated.View style={[styles.card, animatedMainCardStyle]}>
          <Text style={styles.cardText}>Descobre o desafio semanal</Text>
        </Animated.View>

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
    color: "#263A83",
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
