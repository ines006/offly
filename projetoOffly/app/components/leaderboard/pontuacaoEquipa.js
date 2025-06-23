import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { baseurl } from "../../api-config/apiConfig";
import { AuthContext } from "../entrar/AuthContext";
import Svg, { Circle, Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

const DetalhesEquipa = () => {
  const { user, accessToken } = useContext(AuthContext);
  const { teamId } = useLocalSearchParams();
  const router = useRouter();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!user?.id || !accessToken || !teamId || isNaN(parseInt(teamId))) {
        setError(
          "Utilizador não autenticado, equipa não especificada ou ID inválido."
        );
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${baseurl}/teams/${teamId}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        const participants = Array.isArray(response.data.participants)
          ? response.data.participants.map((p) => ({
              id: p.id?.toString() || "",
              username: p.username || "Desconhecido",
              image: p.image,
            }))
          : [];

        setTeam({
          id: response.data.id?.toString() || teamId,
          name: response.data.name || "Desconhecido",
          points: Number(response.data.points) || 0,
          image: response.data.image,
          capacity: Number(response.data.capacity) || 0,
          participants,
          team_admin: {
            id: response.data.team_admin?.id?.toString() || "",
            username: response.data.team_admin?.username || "Desconhecido",
          },
          competition_name:
            response.data.competition_name || "Competição Sem Nome",
          competition_end_date: response.data.competition_end_date || "",
        });
        setError(null);
      } catch (error) {
        setError(
          error.response?.status === 404
            ? `Equipa com ID ${teamId} não encontrada.`
            : error.response?.data?.message ||
                "Erro ao carregar detalhes da equipa. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [user, accessToken, teamId]);

  // Calcular tempo restante
  useEffect(() => {
    if (team?.competition_end_date) {
      const calculateTimeRemaining = () => {
        try {
          const now = new Date();
          const endDate = new Date(team.competition_end_date);
          if (isNaN(endDate.getTime())) {
            setTimeRemaining("Data inválida");
            return;
          }

          const diff = endDate - now;

          if (diff <= 0) {
            setTimeRemaining("Encerrado");
            return;
          }

          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
        } catch (err) {
          setTimeRemaining("Erro");
        }
      };

      calculateTimeRemaining();
      const interval = setInterval(calculateTimeRemaining, 60000); // Atualiza a cada minuto
      return () => clearInterval(interval);
    }
  }, [team]);

  const renderParticipant = ({ item }) => (
    <View style={styles.participantCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.participantImage}
        accessible={true}
        accessibilityLabel={`Imagem de ${item.username}`}
      />
      <Text style={styles.participantName}>{item.username}</Text>
      {item.id === team?.team_admin?.id && (
        <Text style={styles.adminBadge}>Administrador</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#263A83" />
        <Text style={styles.loadingText}>A carregar...</Text>
      </View>
    );
  }

  if (error || !team) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {error || "Equipa não encontrada."}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
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
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
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
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.competitionTitle}>{team.competition_name}</Text>
          <View style={styles.timeContainer}>
            <Svg
              width={width * 0.04}
              height={width * 0.04}
              viewBox="0 0 24 24"
              fill="none"
              style={styles.clockIcon}
            >
              <Path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12 7V12L16 14V16L11 13V7H12Z"
                fill="#263A83"
              />
            </Svg>
            <Text style={styles.timeRemaining}>
              {timeRemaining || "Calculando..."}
            </Text>
          </View>
        </View>
        {/* Adiciona um espaço vazio à direita para balancear o layout */}
        <View style={styles.backButtonPlaceholder} />
      </View>

      <View style={styles.teamCard}>
        <Image
          source={{ uri: team.image }}
          style={styles.teamImage}
          accessible={true}
          accessibilityLabel={`Imagem da equipa ${team.name}`}
        />
        <View style={styles.teamNameContainer}>
          <Text style={styles.teamName}>{team.name}</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.points}>
            <Text style={styles.star}>★</Text> {team.points} pontos
          </Text>
        </View>
        <View style={styles.capacityContainer}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 12C14.21 12 16 8 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
              fill="#FFFFFF"
              fillRule="evenodd"
            />
          </Svg>
          <Text style={styles.capacityText}>
            {team.participants.length}/{team.capacity}
          </Text>
        </View>
      </View>

      <View style={styles.participantsContainer}>
        <View style={styles.participantsBackground} />
        <FlatList
          data={team.participants}
          keyExtractor={(item) => item.id}
          renderItem={renderParticipant}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.participantsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhum participante encontrado.
            </Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: width * 0.04,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Garante que o centro seja realmente o centro
    marginTop: height * 0.1,
    marginBottom: height * 0.02,
  },
  backButton: {
    padding: width * 0.02,
  },
  backButtonPlaceholder: {
    width: 36, // Mesma largura do botão de voltar para balancear o layout
    height: 35,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  competitionTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: height * 0.01,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3FC87", // Nova cor do retângulo
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.005,
    borderRadius: 15,
  },
  clockIcon: {
    marginRight: width * 0.02,
  },
  timeRemaining: {
    fontSize: width * 0.04,
    color: "#263A83",
  },
  teamCard: {
    backgroundColor: "#263A83",
    borderRadius: 15,
    padding: width * 0.05,
    alignItems: "center",
    marginBottom: height * 0.05,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  teamImage: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    marginBottom: height * 0.02,
  },
  teamNameContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.005,
    marginBottom: height * 0.01,
  },
  teamName: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    color: "#263A83",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.01,
  },
  points: {
    fontSize: width * 0.04,
    color: "#E3FC87",
    fontWeight: "bold",
  },
  star: {
    fontSize: width * 0.04,
    color: "#E3FC87",
  },
  capacityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  capacityText: {
    fontSize: width * 0.04,
    color: "#FFFFFF",
    marginLeft: width * 0.02,
  },
  participantsContainer: {
    flex: 1,
    marginBottom: height * 0,
  },
  participantsBackground: {
    position: "absolute",
    bottom: 0,
    top: height * 0,
    left: -width * 0.04,
    right: -width * 0.04,
    backgroundColor: "#E6F0FA",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  participantsList: {
    paddingVertical: height * 0.01,
    paddingBottom: height * 0.05,
  },
  participantCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: width * 0.03,
    marginBottom: height * 0.015,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  participantImage: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    marginRight: width * 0.03,
  },
  participantName: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  adminBadge: {
    fontSize: width * 0.035,
    color: "#5971C9",
    marginLeft: width * 0.02,
  },
  loadingText: {
    fontSize: width * 0.04,
    color: "#263A83",
    marginTop: height * 0.01,
  },
  errorText: {
    fontSize: width * 0.04,
    color: "#FF0000",
    textAlign: "center",
    marginVertical: height * 0.02,
  },
  emptyText: {
    fontSize: width * 0.04,
    color: "#333",
    textAlign: "center",
    paddingVertical: height * 0.02,
  },
});

export default DetalhesEquipa;
