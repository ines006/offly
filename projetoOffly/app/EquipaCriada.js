import { useFonts } from "expo-font";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import { Alert } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Container_Pagina_Equipa_Criada,
  Sub_Titulos_Criar_Equipa,
  Titulos_Equipa_Criada,
  Botoes_Pagina_principal,
  Texto_Botoes_Pagina_principal,
  Botoes_Pagina_principal_Desativado,
  Texto_Botoes_Pagina_principal_Desativado,
} from "./styles/styles";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AuthContext } from "./components/entrar/AuthContext";
import { baseurl } from "./api-config/apiConfig";
import axios from "axios";

export default function EquipaCriada() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  const hasRedirectedRef = useRef(false);
  const intervalIdRef = useRef(null);
  const isJoiningTournamentRef = useRef(false); 

  const { user, accessToken } = useContext(AuthContext);
  const { teamId } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [teamDataLoaded, setTeamDataLoaded] = useState(false);
  const [hasCompetition, setHasCompetition] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamCapacity, setTeamCapacity] = useState();
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();

  // Array de URLs das imagens p/ users
  const imageUrls = [
    "https://celina05.sirv.com/avatares/avatar4.png",
    "https://celina05.sirv.com/avatares/avatar5.png",
    "https://celina05.sirv.com/avatares/avatar6.png",
    "https://celina05.sirv.com/avatares/avatar9.png",
    "https://celina05.sirv.com/avatares/avatar10.png",
    "https://celina05.sirv.com/avatares/avatar11.png",
    "https://celina05.sirv.com/avatares/avatar12.png",
    "https://celina05.sirv.com/avatares/avatar13.png",
    "https://celina05.sirv.com/avatares/avatar16.png",
    "https://celina05.sirv.com/avatares/avatar18.png",
    "https://celina05.sirv.com/avatares/avatar20.png",
    "https://celina05.sirv.com/avatares/avatar1.png",
    "https://celina05.sirv.com/avatares/avatar2.png",
    "https://celina05.sirv.com/avatares/avatar3.png",
    "https://celina05.sirv.com/avatares/avatar7.png",
    "https://celina05.sirv.com/avatares/avatar8.png",
    "https://celina05.sirv.com/avatares/avatar14.png",
    "https://celina05.sirv.com/avatares/avatar15.png",
    "https://celina05.sirv.com/avatares/avatar17.png",
    "https://celina05.sirv.com/avatares/avatar19.png",
  ];

  // Função para obter uma URL aleatória
  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * imageUrls.length);
    return imageUrls[randomIndex];
  };

  // Utilizador logado + Dados do utilizador
  useEffect(() => {
    const fetchUserData = async () => {
      //console.log("🔍 Depurando dados do utilizador...");
      console.log("👤 User:", user);
      console.log("🔑 AccessToken:", accessToken);

      if (!user?.id || !accessToken) {
        console.error("❌ user.id ou accessToken estão indefinidos");
        Alert.alert("Erro", "Sessão inválida. Faça login novamente.");
        router.push("./login");
        return;
      }

      try {
        //console.log(
        //  `🌐 Fazendo requisição para ${baseurl}/participants/${user.id}`
        //);
        const response = await axios.get(`${baseurl}/participants/${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        console.log("Dados do utilizador:", response.data);

        const userData = response.data;
        const name = userData.name || userData.fullName;
        const image = userData.image || null;

        setUserId(user.id);
        setUserName(name);
        setProfileImage(image ? { uri: image } : null);

      } catch (error) {
        console.error("❌ Erro ao buscar dados do utilizador:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        Alert.alert(
          "Erro",
          error.response?.data?.message ||
            "Não foi possível carregar os dados do utilizador."
        );
      }
    };

    fetchUserData();
  }, [user, accessToken]);

  // Função para buscar os dados da equipa
  const teamData = async () => {
    try {
      const response = await axios.get(`${baseurl}/teams/${teamId}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("Dados da equipa:", response.data);

      const teamData = response.data;
      setTeamName(teamData.name);
      setTeamMembers(teamData.participants);
      setTeamCapacity(teamData.capacity);
      setTeamDescription(teamData.description);

      // Verifica se o user é o admin da equipa
      const isUserAdmin = teamData.team_admin.id == userId;
      setIsAdmin(isUserAdmin);

      setTeamDataLoaded(true);

      const hasComp = !!teamData.competition_id;
      console.log("📌 competitions_id:", teamData.competition_id);
      console.log("🔁 Deve redirecionar?", hasComp);

      setHasCompetition(hasComp);

      // Evitar redirecionamento automático para o admin se ele acabou de entrar no torneio
      if (hasComp && !isUserAdmin && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
        console.log("🚀 Redirecionando para Home...");
        router.push("./components/navbar");
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        error.response?.data?.message ||
          "Não foi possível carregar os dados da equipa."
      );
    }
  };

  // Carrega os dados da equipa ao entrar + atualização automática
  useEffect(() => {
    if (userId && teamId) {
      teamData(); 

      intervalIdRef.current = setInterval(teamData, 10000); // polling a cada 10s

      return () => {
        if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      };
    }
  }, [userId, teamId]);

  // Função para entrar no torneio
  const handleTorneio = async () => {
    try {
      // Indica que o admin está a entrar no torneio
      isJoiningTournamentRef.current = true;
      setLoading(true);

      // 1. Obter as competições disponíveis com base na capacidade da equipa
      const responseCompetitions = await axios.get(
        `${baseurl}/teams/competition/available`,
        {
          params: {
            players: teamCapacity,
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      console.log("Competições disponíveis: ", responseCompetitions.data);

      const availableCompetitions = responseCompetitions.data;

      // console.log(
      //   "Length competições disponíveis: ",
      //   availableCompetitions.length
      // );

      // 2. Escolher uma competição aleatória
      if (availableCompetitions.length === 0) {
        Alert.alert(
          "Erro",
          "Não há competições disponíveis no momento para equipes com esta capacidade."
        );
        return;
      }

      const randomCompetition =
        availableCompetitions[
          Math.floor(Math.random() * availableCompetitions.length)
        ];
      console.log("Random competition: ", randomCompetition);

      // 3. Atualizar a equipa com a competição escolhida
      const updatedTeamData = {
        competitions_id: randomCompetition.id,
      };

      const responseUpdateTeam = await axios.put(
        `${baseurl}/teams/${teamId}`,
        updatedTeamData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      console.log("✅ Equipa atualizada:", responseUpdateTeam.data);

      // 4. Cria a caderneta e já atualiza o team_passbooks_id na equipa
      const passbookResponse = await axios.post(
        `${baseurl}/api/team-passbooks`,
        {
          competitions_id: randomCompetition.id,
          team_id: teamId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const newPassbookId = passbookResponse.data.team_passbook_id;
      console.log("✅ Caderneta criada com ID:", newPassbookId);

      // 5. Redirecionar para a navbar após atualização
      hasRedirectedRef.current = true; 
      router.push("./components/navbar");
    } catch (error) {
      console.error("❌ Erro ao entrar no torneio:", error);
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível entrar no torneio."
      );
    } finally {
      isJoiningTournamentRef.current = false;
      setLoading(false);
    }
  };

  // Função para lidar com a saída da equipa
  const handleLeaveTeam = async () => {
    try {
     await axios.put(
          `${baseurl}/participants/${userId}`,
          { teams_id: null },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

      router.push("/PaginaPrincipal");
    } catch (error) {
      console.error("❌ Erro ao sair da equipa:", error);
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível sair da equipa."
      );
    }
  };

  // Função para exibir o alerta de confirmação
  const confirmLeaveTeam = () => {
    Alert.alert(
      "Sair da Equipa",
      "Tem certeza que deseja sair da equipa?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: handleLeaveTeam, 
        },
      ]
    );
  };
  
  if (!teamDataLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#263A83" />
      </View>
    );
  }

  if (!teamName && !teamDescription) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Detalhes da equipa não encontrados.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: "#fff" }}>
      <Container_Pagina_Equipa_Criada>
        {/* Botão de Voltar atrás */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
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

        {/* Botão de Sair da Equipa */}
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={confirmLeaveTeam}
          accessibilityLabel="Sair da equipa"
        >
          <Text style={styles.leaveButtonText}>Sair</Text>
        </TouchableOpacity>


        <Titulos_Equipa_Criada
          accessibilityRole="text"
          accessibilityLabel={teamName}
        >
          {teamName}
        </Titulos_Equipa_Criada>
        <Sub_Titulos_Criar_Equipa
          accessibilityRole="text"
          accessibilityLabel={teamDescription}
        >
          {teamDescription}
        </Sub_Titulos_Criar_Equipa>

        <View style={styles.remainingTeamsContainer}>
          <FlatList
            data={Array.from({ length: teamCapacity })}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ index }) => {
              const participant = teamMembers[index];
              const isEmptySlot = !participant;
              return (
                <View
                  style={[styles.card, isEmptySlot && styles.cardVazio]}
                >
                  <Image
                    source={{
                      uri: isEmptySlot
                        ? "https://celina05.sirv.com/icones/empty-user.png"
                        : participant.image || getRandomImage(),
                    }}
                    style={styles.peopleImage}
                  />
                  <Text
                    style={[
                      styles.participantText,
                      isEmptySlot && styles.participantTextVazio,
                    ]}
                  >
                    {isEmptySlot ? ". . ." : participant.name}
                  </Text>
                </View>
              );
            }}
            showsVerticalScrollIndicator={true}
            style={{ width: "100%" }}
            contentContainerStyle={{ alignItems: "center" }}
          />
          {teamMembers.length === teamCapacity ? (
            isAdmin ? (
              <Botoes_Pagina_principal onPress={handleTorneio}>
                <Texto_Botoes_Pagina_principal>
                  Entrar Torneio
                </Texto_Botoes_Pagina_principal>
              </Botoes_Pagina_principal>
            ) : null
          ) : isAdmin ? (
            <Botoes_Pagina_principal_Desativado>
              <Texto_Botoes_Pagina_principal_Desativado>
                Entrar Torneio
              </Texto_Botoes_Pagina_principal_Desativado>
            </Botoes_Pagina_principal_Desativado>
          ) : null}
        </View>
      </Container_Pagina_Equipa_Criada>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    zIndex: 99,
    position: "absolute",
    left: 25,
  },
  remainingTeamsContainer: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 15,
    paddingBottom: 15,
    width: 370,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 30,
    marginLeft: 30,
    marginRight: 30,
  },
  card: {
    flexDirection: "row",
    padding: 15,
    width: 330,
    marginVertical: 8,
    marginHorizontal: 10,
    backgroundColor: "#263a83",
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
  cardVazio: {
    flexDirection: "row",
    padding: 15,
    width: 330,
    marginVertical: 8,
    marginHorizontal: 10,
    backgroundColor: "#DDDFE6",
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
  peopleImage: {
    width: 60,
    height: 60,
  },
  participantText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10,
    fontWeight: "bold",
  },
  participantTextVazio: {
    fontSize: 40,
    color: "#263a83",
    paddingLeft: 50,
    fontWeight: "bold",
  },
  noParticipants: {
    fontSize: 16,
    color: "#999",
  },
  refreshButton: {
    marginTop: 20,
    backgroundColor: "#263A83",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  refreshText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  leaveButton: {
    position: "absolute",
    right: 25,
    backgroundColor: "#FFE6E6", 
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  leaveButtonText: {
    color: "#FF3B30",
    textAlign: "center",
    fontFamily: "Poppins",
    fontSize: 15,
    fontWeight: "600",
  },
});

