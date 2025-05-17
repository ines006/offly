import React, { useEffect, useState } from "react";
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

const { width } = Dimensions.get("window");

export default function DetalhesDia() {
  const { dia } = useLocalSearchParams();
  const router = useRouter();
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDesafiosDoDia() {
      try {
        const response = await axios.get(`${baseurl}/api/desafios-do-dia?dia=${dia}`);
        setDesafios(response.data);
      } catch (error) {
        console.error("Erro ao buscar desafios do dia:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDesafiosDoDia();
  }, [dia]);

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

      <ScrollView contentContainerStyle={styles.cardList}>
        {desafios.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: `${baseurl}/api/desafios/imagem/${item.challenge.id}` }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.challengeTitle}>{item.challenge.title}</Text>
              <Text style={styles.challengeDescription}>{item.challenge.description}</Text>
              <Text style={styles.realizadoPor}>Realizado por</Text>
              <View style={styles.userRow}>
                <Image
                  source={{ uri: item.participant.avatar || "https://placehold.co/48x48" }}
                  style={styles.avatar}
                />
                <Text style={styles.userName}>{item.participant.name}</Text>
              </View>
            </View>
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
    marginBottom: 10,
  },
  dayContainer: {
    alignSelf: "center",
    backgroundColor: "#2E3A8C",
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  dayText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  cardList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#2E3A8C",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    padding: 10,
  },
  imageContainer: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    width: 120,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  image: {
    width: 120,
    height: 120,
  },
  cardContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2E3A8C",
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
  },
  realizadoPor: {
    fontWeight: "bold",
    color: "#374151",
    fontSize: 14,
    marginBottom: 6,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D1D5DB",
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    color: "#374151",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
