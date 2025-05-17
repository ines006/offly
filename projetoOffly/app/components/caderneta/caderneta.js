import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Svg, Circle, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { baseurl } from '../../api-config/apiConfig';
import { AuthContext } from '../entrar/AuthContext';

const Caderneta = () => {
  const { user } = useContext(AuthContext);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [weeklyChallengeCards, setWeeklyChallengeCards] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchChallenges = async () => {
      setDailyCompleted(false); // reseta estado

      if (!user || !user.id) {
        console.log('❌ Utilizador não autenticado ou id inválido');
        return;
      }

      console.log('✅ ID do utilizador autenticado:', user.id);

      try {
        // 1. Buscar participante com id igual ao user.id
        const respParticipant = await fetch(`${baseurl}/passbook?id=${user.id}`);
        const participantData = await respParticipant.json();

        console.log('📡 Resposta do participante logado:', participantData);

        if (!participantData || participantData.length === 0) {
          console.log('❌ Participante não encontrado para user.id:', user.id);
          return;
        }

        const participant = participantData[0];
        console.log('👤 Participante logado:', participant);

        const teamId = participant.teams_id;
        if (!teamId) {
          console.log('❌ Participante não pertence a nenhuma equipa');
          return;
        }

        console.log(`👥 ID da equipa do participante: ${teamId}`);

        // 2. Buscar todos os participantes da mesma equipa
        const respTeamParticipants = await fetch(`${baseurl}/passbook?teams_id=${teamId}`);
        const teamParticipants = await respTeamParticipants.json();

        console.log(`📡 Participantes da equipa ${teamId}:`, teamParticipants);

        const participantIds = teamParticipants.map((p) => p.id);
        console.log(`🔍 IDs dos participantes da equipa:`, participantIds);

        // 3. Verificar desafios completados para cada participante
        let foundCompleted = false;

        for (const pid of participantIds) {
          const respChallenges = await fetch(`${baseurl}/desafios_completos?participants_id=${pid}`);
          const challenges = await respChallenges.json();

          console.log(`📋 Desafios do participante ${pid}:`, challenges);

          const hasCompleted = challenges.some(
            (challenge) =>
              challenge.completed_date &&
              challenge.completed_date !== '' &&
              challenge.completed_date !== null
          );

          if (hasCompleted) {
            console.log(`✅ Participante ${pid} COMPLETOU pelo menos um desafio diário.`);
            foundCompleted = true;
            break; // basta um membro ter completado
          } else {
            console.log(`⛔ Participante ${pid} NÃO completou desafios diários.`);
          }
        }

        setDailyCompleted(foundCompleted);
        if (!foundCompleted) {
          console.log('ℹ️ Nenhum participante da equipa completou desafios diários.');
        }

      } catch (error) {
        console.error('❌ Erro ao buscar dados da API:', error);
      }
    };

    fetchChallenges();
  }, [user]);

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        {/* Botão de voltar */}
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

        {/* Título */}
        <Text style={styles.title}>Caderneta</Text>

        <View style={styles.viewcaderneta}>
          {/* === Desafios Semanais === */}
          <Text style={styles.sectionTitle}>Desafios semanais</Text>
          <Text style={styles.subtitle}>Vê os desafios das semanas passadas</Text>
          <View style={styles.cardGrid}>
            {weeklyChallengeCards.length > 0 ? (
              weeklyChallengeCards.map((card, idx) => (
                <View key={idx} style={[styles.card, styles.activeCard2]}>
                  <Image
                    source={{ uri: card.imagem }}
                    style={styles.cardImage2}
                    resizeMode="cover"
                  />
                  <Text style={styles.weeklyCardTitle}>{card.titulo || "Sem título"}</Text>
                </View>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.card, styles.inactiveCard]}
                  accessibilityLabel={`Desafio semanal ${idx + 1} ainda não disponível`}
                >
                  <Text style={styles.cardNumber}>{idx + 1}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.divider} />

          {/* === Desafios Diários === */}
          <Text style={styles.sectionTitle}>Desafios diários</Text>
          <Text style={styles.subtitle}>Consulta os desafios dos teus colegas de equipa</Text>

          <View style={styles.cardGrid}>
            {Array.from({ length: 31 }).map((_, idx) => {
              const isCompleted = dailyCompleted && idx === 0;
              return (
                <View
                  key={idx}
                  style={[styles.card, isCompleted ? styles.activeCard : styles.inactiveCard]}
                >
                  {isCompleted ? (
                    <Image
                      source={require('../../imagens/desafiodiario.png')}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.cardContentContainer}>
                      <Text style={styles.cardPlaceholder}>?</Text>
                      <Text style={styles.cardNumber}>{idx + 1}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
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
