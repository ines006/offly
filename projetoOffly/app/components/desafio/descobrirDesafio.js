import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseApi";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

export default function Descobrir() {
  const router = useRouter();
  const scaleAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  const [imageURL, setImageURL] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const docRef = doc(db, "shakecarta", "shakeDesafio");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setImageURL(docSnap.data().imagem);
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
    if (isLoading) return;

    setIsLoading(true);

    rotateAnimation.value = withTiming(360, { duration: 1000, easing: Easing.out(Easing.ease) }, () => {
      rotateAnimation.value = 0;
    });

    scaleAnimation.value = withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.ease) }, () => {
      scaleAnimation.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }, () => {
        runOnJS(handleDiscover)();
      });
    });
  };

  const handleDiscover = async () => {
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert("Erro", "Usuário não está logado.");
        setIsLoading(false);
        return;
      }

      // Buscar o ID da equipa do utilizador logado
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        Alert.alert("Erro", "Usuário não encontrado.");
        setIsLoading(false);
        return;
      }

      const teamName = userDocSnap.data()?.team;

      if (!teamName) {
        Alert.alert("Erro", "Usuário não pertence a nenhuma equipe.");
        setIsLoading(false);
        return;
      }

      // Função para encontrar a próxima carta não validada
      const getNextUnvalidatedCard = async () => {
        for (let i = 0; i < 10; i++) { // Considerando que pode haver até 10 cartas (carta0 até carta9)
          const cardDocRef = doc(db, "desafioSemanal", `carta${i}`);
          const cardDocSnap = await getDoc(cardDocRef);

          if (!cardDocSnap.exists() || !cardDocSnap.data()?.validada) {
            return `carta${i}`; // Retorna o nome da próxima carta não validada
          }
        }
        return null; // Todas as cartas estão validadas
      };

      const nextCard = await getNextUnvalidatedCard();

      if (!nextCard) {
        Alert.alert("Erro", "Todas as cartas já foram validadas!");
        setIsLoading(false);
        return;
      }

      // Buscar os participantes da equipa
      const teamDocRef = doc(db, "equipas", teamName, "membros", "participantes");
      const teamDocSnap = await getDoc(teamDocRef);

      if (!teamDocSnap.exists()) {
        Alert.alert("Erro", "Equipe ou participantes não encontrados.");
        setIsLoading(false);
        return;
      }

      const participants = teamDocSnap.data();

      // Adicionar na próxima carta não validada
      const challengeTeamRef = doc(db, "desafioSemanal", nextCard, "equipasDesafio", teamName);
      await setDoc(challengeTeamRef, {}); // Criar o documento da equipa ao qual o utilizador pertence

      for (const [key, value] of Object.entries(participants)) {
        const participantCollectionRef = collection(challengeTeamRef, key); // participante1, participante2, ...
        const participantDocRef = doc(participantCollectionRef, value); // Nome do participante que está como documento dentro da subcoleção com o participante (número do participante)

        const fields = {};
        for (let i = 1; i <= 7; i++) {
          fields[i] = false; // Adicionar os campos numerados com valor booleano false de 1 a 7 que são os dias da semana
        }

        await setDoc(participantDocRef, fields);
      }

      // Adicionar o timer
      const timerCollectionRef = collection(challengeTeamRef, "timer");
      const timerDocRef = doc(timerCollectionRef, "start");

      const now = Date.now(); // Horário atual em Unix Timestamp
      const oneWeekFromNow = now + 7 * 24 * 60 * 60 * 1000; // Adicionar 7 dias ao horário atual

      await setDoc(timerDocRef, {
        startTime: now,
        endTime: oneWeekFromNow,
      });

      runOnJS(() => router.push("../desafio/desafioSemanal"))(); // Navegar após o sucesso
    } catch (error) {
      console.error("Erro ao atualizar desafio semanal:", error);
      Alert.alert("Erro", "Não foi possível atualizar o desafio semanal.");
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
        {/* Carta principal */}
        <Animated.View style={[styles.card, animatedMainCardStyle]}>
          {imageURL ? (
            <Image
              accessibilityLabel="Imagem para descobrir carta do desafio semanal"
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

        <TouchableOpacity  style={styles.discoverButton} onPress={triggerAnimation} disabled={isLoading}>
          <Text style={styles.discoverButtonText}>{isLoading ? "Carregando..." : "Descobrir"}</Text>
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
