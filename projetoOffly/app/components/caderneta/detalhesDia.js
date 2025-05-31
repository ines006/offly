import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { baseurl } from "../../api-config/apiConfig";
import { AuthContext } from "../entrar/AuthContext";

const { width } = Dimensions.get("window");

export default function DetalhesDia() {
  const { dia } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [participantesComDesafios, setParticipantesComDesafios] = useState([]);
  const [loading, setLoading] = useState(true);

  const getValidImageUrl = (url) => {
    return url && url !== "undefined" ? url : "https://placehold.co/100x100";
  };

  useEffect(() => {
    async function fetchDetalhesDoDia() {
      try {
        const response = await axios.get(`${baseurl}/api/desafios-do-dia`, {
          params: { dia, participanteId: user.id },
        });

        const { teamMembers, completedChallenges } = response.data;

        const desafiosPorParticipante = {};
        completedChallenges.forEach(({ participant, challenge }) => {
          if (!desafiosPorParticipante[participant.id]) {
            desafiosPorParticipante[participant.id] = [];
          }
          desafiosPorParticipante[participant.id].push({ challenge, participant });
        });

        const resultado = teamMembers.map((membro) => ({
          ...membro,
          desafios: desafiosPorParticipante[membro.id] || [],
        }));

        // Ordenar: realizados primeiro
        resultado.sort((a, b) => {
          const aTemDesafio = a.desafios.length > 0;
          const bTemDesafio = b.desafios.length > 0;
          return aTemDesafio === bTemDesafio ? 0 : aTemDesafio ? -1 : 1;
        });

        setParticipantesComDesafios(resultado);
      } catch (error) {
        console.error("Erro ao buscar detalhes do dia:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchDetalhesDoDia();
    }
  }, [dia, user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E3A8C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Desafios diários</Text>

      <View style={styles.dayContainer}>
        <Text style={styles.dayText}>Dia {dia}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {participantesComDesafios.map((membro) => (
          <View key={membro.id} style={styles.card}>
            {membro.desafios.length > 0 ? (
              membro.desafios.map((item, index) => (
                <View key={index} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <Image
                      source={{ uri: `${baseurl}/api/desafios/imagem/${item.challenge.id}` }}
                      style={styles.challengeImage}
                      resizeMode="contain"
                    />
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeTitle}>{item.challenge.title}</Text>
                      <Text style={styles.challengeDescription}>
                        {item.challenge.description}
                      </Text>
                      <Text style={styles.realizadoPor}>Realizado por</Text>
                      <View style={styles.authorRow}>
                        <Image
                          source={{ uri: getValidImageUrl(membro.image) }}
                          style={styles.authorImage}
                        />
                        <Text style={styles.authorName}>{membro.name}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.placeholderLeft}>
                  <Text style={styles.plus}>+</Text>
                </View>
                <View style={styles.placeholderRight}>
                  <TouchableOpacity style={styles.flyButton}>
                    <Text style={styles.flyButtonText}>Mandar um fly</Text>
                  </TouchableOpacity>
                  <View style={styles.authorRow2}>
                    <Image
                      source={{ uri: getValidImageUrl(membro.image) }}
                      style={styles.authorImage}
                    />
                    <Text style={styles.authorName2}>{membro.name}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "#FFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  backText: {
    fontSize: 22,
    color: "#2E3A8C",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E3A8C",
    alignSelf: "center",
  },
  dayContainer: {
    alignSelf: "center",
    backgroundColor: "#2E3A8C",
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 16,
  },
  dayText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    marginBottom: 24,
  },
  challengeCard: {
    backgroundColor: "#2E3A8C",
    borderRadius: 16,
    padding: 12,
  },
  challengeHeader: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  challengeImage: {
    width: 100,
    height: 100,
    margin: 12,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  challengeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  challengeTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#111827",
  },
  challengeDescription: {
    fontSize: 13,
    color: "#374151",
    marginVertical: 6,
  },
  realizadoPor: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4B5563",
    marginTop: 8,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  authorRow2: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  authorImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  authorName: {
    fontSize: 13,
    color: "#000000",
  },

  authorName2: {
    fontSize: 13,
    color: "#fff",
  },
  emptyCard: {
    flexDirection: "row",
    backgroundColor: "#2E3A8C",
    borderRadius: 16,
    overflow: "hidden",
  },
  placeholderLeft: {
    width: "35%",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  plus: {
    fontSize: 48,
    color: "#2E3A8C",
    fontWeight: "bold",
  },
  placeholderRight: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#2E3A8C",
  },
  flyButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignSelf: "flex-start",
  },
  flyButtonText: {
    color: "#2E3A8C",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
