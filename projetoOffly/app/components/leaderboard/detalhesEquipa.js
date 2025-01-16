import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Svg, Circle, Path } from "react-native-svg";

const DetalhesEquipa = () => {
  const { teamId } = useLocalSearchParams();
  const [teamDetails, setTeamDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handlePress = () => {
    // Navega para a página da Caderneta
    router.push("../caderneta/caderneta"); // Supondo que a página se chame 'caderneta.js'
  };

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        // Aqui busca os dados principais da equipa
        const docRef = doc(db, "equipas", teamId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTeamDetails(docSnap.data());
        } else {
          console.error("Documento não encontrado!");
        }

        // Aqui busca os participantes na subcoleção 'membros/participantes' (firsebase/firestore da Celina)
        const participantsRef = doc(
          db,
          "equipas",
          teamId,
          "membros",
          "participantes"
        );
        const participantsSnap = await getDoc(participantsRef);

        if (participantsSnap.exists()) {
          // Extrair os valores dos campos
          const participantsData = Object.values(participantsSnap.data());
          setParticipants(participantsData);
        } else {
          console.error("Documento de participantes não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes da equipa:", error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeamDetails();
    }
  }, [teamId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#263A83" />
      </View>
    );
  }

  if (!teamDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Detalhes da equipa não encontrados.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>
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
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>Torneio XPTO</Text>

      <View style={styles.info}>
        <Image
          source={require("../../imagens/1.png")}
          style={styles.teamImage}
        />

        <View style={styles.textContainer}>
          <Text style={styles.labelnome}>{teamId}</Text>
          <Text style={styles.labelpontos}>{teamDetails.pontos} pontos</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Ver Caderneta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log("Ir para Desafio Semanal")}
        >
          <Text style={styles.buttonText}>Ver Desafio Semanal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.remainingTeamsContainer}>
        {participants.length > 0 ? (
          participants.map((participant, index) => (
            <View key={index} style={styles.card}>
              <Image
                source={require("../../imagens/2.png")}
                style={styles.peopleImage}
              />
              <Text style={styles.participantText}>{participant}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noParticipants}>
            Nenhum participante encontrado.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 40,
    width: 40,
    height: 40,
    left: 25,
    borderRadius: 25,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#D32F2F",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#263A83",
    textAlign: "center",
    marginTop: 27,
    marginBottom: 30,
  },
  labelnome: {
    fontSize: 19,
    color: "#333",
    marginBottom: 10,
    color: "#263A83",
  },
  labelpontos: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    color: "#263A83",
  },
  labelTitle: {
    fontWeight: "bold",
    color: "#263A83",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#D2E9FF",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  participantsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: 10,
  },
  participantItem: {
    backgroundColor: "#E3E3E3",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  participantText: {
    fontSize: 16,
    color: "#263A83",
    marginLeft: 10,
    fontWeight: "bold",
  },
  noParticipants: {
    fontSize: 16,
    color: "#999",
  },
  card: {
    flexDirection: "row",
    padding: 15,
    width: 330,
    marginVertical: 8,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    height: 75,
  },
  remainingTeamsContainer: {
    flex: 1,
    backgroundColor: "#D2E9FF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 15,
    paddingBottom: 15,
    width: 370,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  teamImage: {
    width: 90,
    height: 90,
    marginLeft: 10,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  textContainer: {
    flexDirection: "column",
    marginLeft: 10,
    marginTop: 10,
  },
  peopleImage: {
    width: 60,
    height: 60,
  },
});

export default DetalhesEquipa;
