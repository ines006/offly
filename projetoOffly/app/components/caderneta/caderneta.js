import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Svg, Circle, Path } from "react-native-svg";
import { AuthContext } from "../../components/entrar/AuthContext";
import axios from "axios";
import dayjs from "dayjs";

import { baseurl } from "../../api-config/apiConfig";

const Caderneta = () => {
  const [completedDays, setCompletedDays] = useState([]);
  const [weeklyChallengeCards, setWeeklyChallengeCards] = useState([]);
  const router = useRouter();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchTeamChallenges = async () => {
      try {
        if (!user) return;

        // 1. Vai buscar o teams_id do participante logado
        const participantRes = await axios.get(`${baseurl}/participants/user/${user.id}`);
        const teamId = participantRes.data.teams_id;

        // 2. Vai buscar todos os participantes com o mesmo teams_id
        const teamParticipantsRes = await axios.get(`${baseurl}/participants/team/${teamId}`);
        const participants = teamParticipantsRes.data;

        // 3. Recolhe os dias do mês com desafios completos
        const daysSet = new Set();

        for (const participant of participants) {
          const challengesRes = await axios.get(`${baseurl}/participants_has_challenge/participant/${participant.id}`);

          challengesRes.data.forEach((entry) => {
            if (entry.completed_date) {
              const day = dayjs(entry.completed_date).date(); // dia do mês
              daysSet.add(day);
            }
          });
        }

        setCompletedDays(Array.from(daysSet));
      } catch (err) {
        console.error("Erro ao buscar desafios diários:", err);
      }
    };

    const fetchWeeklyChallenges = async () => {
      try {
        const res = await axios.get(`${baseurl}/desafio-semanal`);
        const validChallenges = res.data.filter((c) => c.validada === true);
        setWeeklyChallengeCards(validChallenges);
      } catch (err) {
        console.error("Erro ao buscar desafios semanais:", err);
      }
    };

    fetchTeamChallenges();
    fetchWeeklyChallenges();
  }, [user]);

  const getDaysInMonth = () => {
    const now = dayjs();
    return now.daysInMonth();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
      <View style={styles.container} accessible={true} accessibilityLabel="Página da Caderneta">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
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

        <Text style={styles.title} accessibilityRole="header">Caderneta</Text>

        <View style={styles.viewcaderneta}>
          {/* --- Desafios Semanais --- */}
          <TouchableOpacity>
            <Text style={styles.sectionTitle}>Desafios semanais</Text>
            <Text style={styles.subtitle}>Vê os desafios das semanas passadas</Text>
          </TouchableOpacity>

          <View style={styles.cardGrid}>
            {weeklyChallengeCards.map((card) => (
              <View key={card.id} style={[styles.card, styles.activeCard2]} accessible={true}>
                {card.imagem ? (
                  <Image
                    source={{ uri: card.imagem }}
                    style={styles.cardImage2}
                    resizeMode="cover"
                    accessible={true}
                    accessibilityLabel={`Imagem do desafio ${card.titulo}`}
                  />
                ) : (
                  <Text style={styles.cardTitle}>Imagem não disponível</Text>
                )}
                <Text style={styles.weeklyCardTitle}>{card.titulo || "Sem título"}</Text>
              </View>
            ))}

            {Array.from({ length: 4 - weeklyChallengeCards.length }).map((_, index) => (
              <View
                key={weeklyChallengeCards.length + index}
                style={[styles.card, styles.inactiveCard]}
                accessibilityLabel={`Desafio semanal ${weeklyChallengeCards.length + index + 1} ainda não disponível`}
              >
                <Text style={styles.cardNumber}>{weeklyChallengeCards.length + index + 1}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* --- Desafios Diários --- */}
          <TouchableOpacity>
            <Text style={styles.sectionTitle}>Desafios diários</Text>
            <Text style={styles.subtitle}>Consulta os desafios dos teus colegas de equipa</Text>
          </TouchableOpacity>

          <View style={styles.cardGrid}>
            {Array.from({ length: getDaysInMonth() }).map((_, index) => {
              const dayNumber = index + 1;
              const isCompleted = completedDays.includes(dayNumber);

              return (
                <Card
                  key={dayNumber}
                  number={dayNumber}
                  hasIcon={isCompleted}
                  imageUrl={isCompleted ? require("../../imagens/desafiodiario.png") : null}
                />
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const Card = ({ number, imageUrl, hasIcon }) => {
  return (
    <View
      style={[styles.card, hasIcon ? styles.activeCard : styles.inactiveCard]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={hasIcon ? `Desafio diário ${number} disponível` : `Desafio diário ${number} ainda não disponível`}
    >
      {imageUrl ? (
        <Image
          source={imageUrl}
          style={styles.cardImage}
          resizeMode="cover"
          accessible={true}
        />
      ) : (
        <View style={styles.cardContentContainer}>
          <Text style={styles.cardPlaceholder}>?</Text>
          <Text style={styles.cardNumber}>{number}</Text>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#263A83",
    top: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#263A83",
    marginBottom: 15,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "22%",
    height: 120,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 5,
  },
  activeCard: {
    backgroundColor: "#D8EAF8", 
    borderRadius: 8,
    overflow: "hidden",
  },
  activeCard2: {
    backgroundColor: "#E3FC87", 
    borderRadius: 8,
    overflow: "hidden",
  },
  inactiveCard: {
    backgroundColor: "#EDEDF1", 
    borderColor: "#263A83",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  cardWithImage: {
    overflow: "hidden",
    padding: 0,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardContentContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  cardPlaceholder: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#C5C6D0",
    textAlign: "center",
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D2F45",
    position: "absolute",
    left: 52,
    top: 92,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF", 
    textAlign: "center",
  },
  cardContent: {
    fontSize: 14,
    color: "#6C6F90",
    textAlign: "center",
  },
  divider: {
    height: 3,
    backgroundColor: "#263A83",
    marginVertical: 20,
  },
  viewcaderneta: {
    top: 60,
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
  cardImage2: {
    marginTop: 10,
    width: "100%", 
    height: "60%", 
    alignSelf: "center", 
    borderRadius: 8, 
  },
  weeklyCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black", 
    textAlign: "center",
    marginTop: 5,
  },
});

export default Caderneta;
