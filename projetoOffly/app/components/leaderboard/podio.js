import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { baseurl } from "../../api-config/apiConfig";
import { AuthContext } from "../entrar/AuthContext";

const { width, height } = Dimensions.get("window");

const PodioPontuacao = () => {
  const [teams, setTeams] = useState([]);
  const [competitionName, setCompetitionName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userTeamName, setUserTeamName] = useState(null); // Armazenar o nome da equipa do utilizador
  const { user, accessToken } = useContext(AuthContext);
  const router = useRouter();
  const { teamVariation } = useLocalSearchParams();

  useEffect(() => {
    const fetchCompetitionAndTeams = async () => {
      try {
        setIsLoading(true);
        if (!user?.id || !accessToken) {
          console.error("Utilizador ou token não disponíveis.");
          setCompetitionName("Erro: Utilizador não autenticado");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        };

        console.log("Buscando participante para user.id:", user.id);
        const participantResponse = await axios.get(
          `${baseurl}/participants/${user.id}`,
          config
        );
        const teamsId = participantResponse.data.teams_id;
        console.log("teams_id obtido:", teamsId);

        if (!teamsId) {
          console.error("Utilizador não está associado a nenhuma equipa.");
          setCompetitionName("Erro: Nenhuma equipa associada");
          return;
        }

        console.log("Buscando equipa para teams_id:", teamsId);
        const teamResponse = await axios.get(
          `${baseurl}/teams/${teamsId}`,
          config
        );
        const competitionId = teamResponse.data.competition_id;
        const userTeam = teamResponse.data.name; // Obter o nome da equipa do utilizador
        const compName =
          teamResponse.data.competition_name || "Competição Sem Nome";
        console.log(
          "competition_id:",
          competitionId,
          "competition_name:",
          compName,
          "user_team_name:",
          userTeam
        );
        setUserTeamName(userTeam); // Armazenar o nome da equipa do utilizador

        console.log("Buscando equipas para competition_id:", competitionId);
        const teamsResponse = await axios.get(
          `${baseurl}/teams/competition/${competitionId}`,
          config
        );

        console.log(
          "Resposta do endpoint /teams/competition:",
          JSON.stringify(teamsResponse.data, null, 2)
        );

        let teamsData = [];
        if (Array.isArray(teamsResponse.data)) {
          teamsData = teamsResponse.data;
        } else if (
          teamsResponse.data.teams &&
          Array.isArray(teamsResponse.data.teams)
        ) {
          teamsData = teamsResponse.data.teams;
        } else {
          console.error(
            "Resposta não contém um array de equipas:",
            teamsResponse.data
          );
          setCompetitionName("Erro: Nenhuma equipa encontrada");
          setTeams([]);
          return;
        }

        const formattedTeams = teamsData
          .filter((team) => team && team.name && team.image)
          .map((team) => {
            const teamId = team.id?.toString() || team.name?.toString();
            const currentPoints = Number(team.points) || 0;
            const acquired = Number(team.last_variation) || 0;

            return {
              id: teamId,
              name: team.name || "Desconhecido",
              points: currentPoints,
              acquired: acquired,
              totalPoints: currentPoints,
              imageUrl: team.image,
            };
          });

        console.log("Equipas formatadas:", formattedTeams);

        setTeams(formattedTeams.sort((a, b) => b.totalPoints - a.totalPoints));
        setCompetitionName(teamsResponse.data.competition_name || compName);
      } catch (error) {
        console.error(
          "Erro ao buscar dados da competição:",
          error.response || error
        );
        setCompetitionName("Erro ao carregar competição");
        setTeams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetitionAndTeams();
  }, [user, accessToken]);

  const Podium = () => {
    const hasFirst = teams.length > 0;
    const hasSecond = teams.length > 1;
    const hasThird = teams.length > 2;

    return (
      <TouchableOpacity>
        <View style={styles.podiumContainer}>
          <TouchableOpacity>
            <View style={[styles.podiumSection, styles.secondPlaceSection]}>
              <Image
                source={{ uri: hasSecond ? teams[1].imageUrl : undefined }}
                style={styles.teamImage}
                accessible={true}
                accessibilityLabel={`Imagem da equipa ${
                  hasSecond ? teams[1].name : "Sem equipa"
                }`}
              />
              <Text style={styles.podiumTeam}>
                {hasSecond ? teams[1].name : "-"}
              </Text>
              <Text style={styles.podiumPoints}>
                {hasSecond ? `${teams[1].totalPoints} P` : "-"}
              </Text>
              {hasSecond && teams[1].acquired !== 0 && 1 >= 3 && (
                <Text
                  style={[
                    styles.acquired,
                    { color: teams[1].acquired >= 0 ? "#1D9A6C" : "#D32F2F" },
                  ]}
                >
                  {teams[1].acquired >= 0
                    ? `+${teams[1].acquired}`
                    : teams[1].acquired}{" "}
                  {teams[1].acquired >= 0 ? "▲" : "▼"}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <View style={[styles.podiumSection, styles.firstPlaceSection]}>
              <Image
                source={{ uri: hasFirst ? teams[0].imageUrl : undefined }}
                style={styles.teamImage}
                accessible={true}
                accessibilityLabel={`Imagem da equipa ${
                  hasFirst ? teams[0].name : "Sem equipa"
                }`}
              />
              <Text style={styles.podiumTeam}>
                {hasFirst ? teams[0].name : "-"}
              </Text>
              <Text style={styles.podiumPoints}>
                {hasFirst ? `${teams[0].totalPoints} P` : "-"}
              </Text>
              {hasFirst && teams[0].acquired !== 0 && 0 >= 3 && (
                <Text
                  style={[
                    styles.acquired,
                    { color: teams[0].acquired >= 0 ? "#1D9A6C" : "#D32F2F" },
                  ]}
                >
                  {teams[0].acquired >= 0
                    ? `+${teams[0].acquired}`
                    : teams[0].acquired}{" "}
                  {teams[0].acquired >= 0 ? "▲" : "▼"}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <View style={[styles.podiumSection, styles.thirdPlaceSection]}>
              <Image
                source={{ uri: hasThird ? teams[2].imageUrl : undefined }}
                style={styles.teamImage}
                accessible={true}
                accessibilityLabel={`Imagem da equipa ${
                  hasThird ? teams[2].name : "Sem equipa"
                }`}
              />
              <Text style={styles.podiumTeam}>
                {hasThird ? teams[2].name : "-"}
              </Text>
              <Text style={styles.podiumPoints}>
                {hasThird ? `${teams[2].totalPoints} P` : "-"}
              </Text>
              {hasThird && teams[2].acquired !== 0 && 2 >= 3 && (
                <Text
                  style={[
                    styles.acquired,
                    { color: teams[2].acquired >= 0 ? "#1D9A6C" : "#D32F2F" },
                  ]}
                >
                  {teams[2].acquired >= 0
                    ? `+${teams[2].acquired}`
                    : teams[2].acquired}{" "}
                  {teams[2].acquired >= 0 ? "▲" : "▼"}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const RemainingTeams = () => (
    <FlatList
      data={teams.slice(3)}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        console.log(
          "Comparação: userTeamName =",
          userTeamName,
          "item.name =",
          item.name
        );
        return (
          <TouchableOpacity
            style={[
              styles.card,
              userTeamName && item.name === userTeamName && styles.userTeamCard,
            ]}
            onPress={() =>
              router.push({
                pathname: "../leaderboard/detalhesEquipa",
                params: { teamId: item.id },
              })
            }
          >
            <View style={styles.rankCircle}>
              <Text style={styles.rankText}>{index + 4}</Text>
            </View>
            <Image
              accessibilityLabel={`Imagem da equipa ${
                item.name || "Desconhecido"
              }`}
              source={{ uri: item.imageUrl }}
              style={styles.teamIcon}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name || "Desconhecido"}</Text>
              <Text style={styles.points}>{item.totalPoints || 0} pontos</Text>
            </View>
            {item.acquired !== 0 && (
              <Text
                style={[
                  styles.acquired,
                  { color: item.acquired >= 0 ? "#1D9A6C" : "#D32F2F" },
                ]}
              >
                {item.acquired >= 0 ? `+${item.acquired}` : item.acquired}{" "}
                {item.acquired >= 0 ? "▲" : "▼"}
              </Text>
            )}
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={() => (
        <Text style={styles.emptyText}>
          Nenhuma equipa adicional encontrada
        </Text>
      )}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#263A83" />
        <Text style={styles.loadingText}>A carregar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{competitionName}</Text>
      <View style={styles.podiumWrapper}>
        <View style={styles.circlesContainer}>
          <View style={styles.circleOuter} />
          <View style={styles.circleMiddle} />
          <View style={styles.circleInner} />
        </View>
        {teams.length > 0 ? (
          <Podium />
        ) : (
          <Text style={styles.emptyText}>
            Nenhuma equipa disponível para o pódio
          </Text>
        )}
        <ImageBackground
          accessible={true}
          accessibilityLabel="Ilustração do pódio com segundo, primeiro e terceiro lugar"
          source={require("../../imagens/podioImagem.png")}
          style={styles.podiumBackground}
          imageStyle={styles.podiumImage}
        />
      </View>
      <View style={styles.remainingTeamsContainer}>
        <RemainingTeams />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.02,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: width * 0.045,
    color: "#263A83",
    marginTop: 10,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: "#263A83",
    textAlign: "center",
    marginVertical: height * 0.02,
    marginTop: height * 0.1,
  },
  podiumWrapper: {
    position: "relative",
    alignItems: "center",
    height: height * 0.6,
  },
  circlesContainer: {
    position: "absolute",
    top: height * 0.1,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  circleOuter: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: width * 0.01,
    borderColor: "#E0E7FF",
    opacity: 0.5,
  },
  circleMiddle: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    borderWidth: width * 0.008,
    borderColor: "#B3C5EF",
    opacity: 0.7,
  },
  circleInner: {
    position: "absolute",
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    borderWidth: width * 0.005,
    borderColor: "#A3BFFA",
    opacity: 0.9,
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: height * -0.1,
    zIndex: 2,
  },
  podiumBackground: {
    position: "absolute",
    top: height * 0.15,
    left: 0,
    right: 0,
    height: height * 1,
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 1,
  },
  podiumImage: {
    resizeMode: "contain",
    width: width,
    height: height * 0.32,
  },
  podiumSection: {
    alignItems: "center",
    marginHorizontal: width * 0.01,
  },
  firstPlaceSection: {
    marginBottom: height * 0.03,
    padding: width * 0.035,
  },
  secondPlaceSection: {
    marginBottom: height * -0.05,
  },
  thirdPlaceSection: {
    marginBottom: height * -0.1,
  },
  podiumTeam: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#333",
    marginVertical: height * 0.005,
  },
  podiumPoints: {
    fontSize: width * 0.035,
    color: "white",
    backgroundColor: "#5971C9",
    padding: width * 0.015,
    width: width * 0.15,
    textAlign: "center",
    borderRadius: 10,
  },
  teamImage: {
    width: width * 0.15,
    height: width * 0.15,
  },
  remainingTeamsContainer: {
    flex: 1,
    backgroundColor: "#D2E9FF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    paddingTop: height * 0.015,
    width: width * 0.95,
    alignSelf: "center",
    marginTop: height * -0.17,
  },
  card: {
    flexDirection: "row",
    padding: width * 0.035,
    width: width * 0.85,
    marginVertical: height * 0.01,
    marginHorizontal: width * 0.025,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    height: height * 0.09,
  },
  userTeamCard: {
    backgroundColor: "#E3FC87",
  },
  rankCircle: {
    width: width * 0.07,
    height: width * 0.07,
    borderRadius: width * 0.035,
    borderWidth: 2,
    borderColor: "#263A83",
    justifyContent: "center",
    alignItems: "center",
    marginRight: width * 0.025,
    backgroundColor: "transparent",
  },
  rankText: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#263A83",
  },
  teamIcon: {
    width: width * 0.15,
    height: width * 0.15,
    marginRight: width * 0.025,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#333",
  },
  points: {
    fontSize: width * 0.035,
    color: "gray",
  },
  acquired: {
    fontSize: width * 0.04,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: width * 0.04,
    color: "#333",
    textAlign: "center",
    marginTop: height * 0.02,
  },
});

export default PodioPontuacao;
