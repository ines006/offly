import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useRouter, useLocalSearchParams } from "expo-router";
import { baseurl } from "../../api-config/apiConfig";

const DesafioSemanal = () => {
  const { teamId } = useLocalSearchParams(); // recebe o teamId da URL
  const router = useRouter();
  const [desafio, setDesafio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesafio = async () => {
      if (!teamId) {
        console.error("Parâmetro teamId não fornecido.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${baseurl}/api/${teamId}`);
        if (!response.ok) throw new Error("Erro ao buscar desafio");

        const data = await response.json();

        const imagemUrl = `${baseurl}/api/desafios/imagem/${data.challenges_id}`;
        setDesafio({
          id: data.challenges_id,
          title: data.title,
          description: data.description,
          imagem: imagemUrl,
        });
      } catch (error) {
        console.error("Erro ao carregar desafio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesafio();
  }, [teamId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Svg width={36} height={35} viewBox="0 0 36 35" fill="none">
          <Circle cx="18.1351" cy="17.1713" r="16.0177" stroke="#263A83" strokeWidth={2} />
          <Path
            d="M21.4043 9.06396L13.1994 16.2432C12.7441 16.6416 12.7441 17.3499 13.1994 17.7483L21.4043 24.9275"
            stroke="#263A83"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Desafio da Semana</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#263A83" />
      ) : desafio ? (
        <View style={styles.cardContainer}>
          <View style={styles.mainCard}>
            {desafio.imagem && (
              <Image
                source={{ uri: desafio.imagem }}
                style={styles.cardImage}
                resizeMode="cover"
                accessibilityLabel="Imagem do desafio"
              />
            )}
            <Text style={styles.cardTitle}>{desafio.title}</Text>
            <Text style={styles.cardDescription}>{desafio.description}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.loadingText}>Nenhum desafio disponível.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 48,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    color: "#263A83",
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  cardContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  mainCard: {
    backgroundColor: "#F4F6FA",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: "#333",
  },
  loadingText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 32,
  },
});

export default DesafioSemanal;
