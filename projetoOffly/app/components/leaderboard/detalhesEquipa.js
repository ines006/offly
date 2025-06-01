import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { baseurl } from "../../api-config/apiConfig";
import { AuthContext } from "../entrar/AuthContext";
import { Svg, Circle, Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

const DetalhesEquipa = () => {
  const { user, accessToken } = useContext(AuthContext);
  const { teamId } = useLocalSearchParams();
  const [teamDetails, setTeamDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false); // Estado para controlar o modal
  const [selectedParticipant, setSelectedParticipant] = useState(null); // Participante selecionado para remoção
  const router = useRouter();

  const imageUrls = [
    "https://celina05.sirv.com/equipas/participante1.png",
    "https://celina05.sirv.com/equipas/participante2.png",
    "https://celina05.sirv.com/equipas/participante3.png",
    "https://celina05.sirv.com/equipas/participante4.png",
    "https://celina05.sirv.com/equipas/participante5.png",
  ];

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * imageUrls.length);
    return imageUrls[randomIndex];
  };

  useEffect(() => {
    if (teamDetails?.competition_end_date) {
      const calculateTimeRemaining = () => {
        try {
          const now = new Date();
          const endDate = new Date(teamDetails.competition_end_date);
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
      const interval = setInterval(calculateTimeRemaining, 60000);
      return () => clearInterval(interval);
    }
  }, [teamDetails]);

  const openMenu = () => setShowMenu(true);
  const closeMenu = () => setShowMenu(false);

  const handleDeleteTeam = async () => {
    // Mantendo o Alert.alert para exclusão de equipa, já que não foi mencionado que ele não funciona aqui
    Alert.alert(
      "Confirmar exclusão",
      "Tens a certeza que queres excluir esta equipa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${baseurl}/teams/${teamId}`, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "ngrok-skip-browser-warning": "true",
                },
              });
              console.log("Equipa excluída com sucesso:", teamId);
              router.back();
            } catch (error) {
              console.error(
                "Erro ao excluir equipa:",
                error.response?.data || error.message
              );
              Alert.alert(
                "Erro",
                "Não foi possível excluir a equipa. Tente novamente."
              );
            }
          },
        },
      ]
    );
  };

  const handleSettings = () => {
    console.log("Ir para Definições");
    closeMenu();
  };

  const handleCadernetaPress = (teamId) => {
    router.push("../../components/caderneta/caderneta");
  };

  const handleDesafioPress = (teamId) => {
    router.push("../../components/desafio/verificarDesafio");
  };

  const removeParticipant = async (participantId) => {
    console.log("Iniciando remoção do participante:", participantId);
    console.log(
      "Endpoint:",
      `${baseurl}/teams/${teamId}/participants/${participantId}`
    );
    console.log("Headers:", {
      Authorization: `Bearer ${accessToken}`,
      "ngrok-skip-browser-warning": "true",
    });

    try {
      const response = await axios.delete(
        `${baseurl}/teams/${teamId}/participants/${participantId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      console.log("Resposta da API:", response.status, response.data);
      console.log(`Participante ${participantId} removido com sucesso.`);

      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p.id !== participantId)
      );
    } catch (error) {
      console.error(
        "Erro ao remover participante:",
        error.response ? error.response.data : error.message
      );
      // Usando o modal para exibir erros também
      setShowModal(true);
      setSelectedParticipant({
        id: participantId,
        name: null,
        error:
          error.response?.data?.message ||
          "Não foi possível remover o participante. Tente novamente.",
      });
    }
  };

  const handleRemoveParticipant = (participantId, participantName) => {
    console.log(
      "Botão de remoção clicado para participante:",
      participantId,
      participantName
    );
    // Abrir o modal e armazenar o participante selecionado
    setSelectedParticipant({
      id: participantId,
      name: participantName,
      error: null,
    });
    setShowModal(true);
  };

  const confirmRemoveParticipant = () => {
    if (selectedParticipant && selectedParticipant.id) {
      removeParticipant(selectedParticipant.id);
    }
    setShowModal(false);
    setSelectedParticipant(null);
  };

  const cancelRemoveParticipant = () => {
    setShowModal(false);
    setSelectedParticipant(null);
  };

  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!user?.id || !accessToken || !teamId || isNaN(parseInt(teamId))) {
        console.error("Utilizador, token ou teamId inválido.");
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

        const teamData = response.data;
        setTeamDetails({
          name: teamData.name || "Equipa Sem Nome",
          pontos: Number(teamData.points) || 0,
          competition_name: teamData.competition_name || "Competição Sem Nome",
          competition_end_date: teamData.competition_end_date || "",
          team_admin: teamData.team_admin || null,
        });

        const isUserAdmin =
          teamData.team_admin && user.id == teamData.team_admin.id;
        setIsAdmin(isUserAdmin);

        const participantsList = Array.isArray(teamData.participants)
          ? teamData.participants.map((p) => ({
              id: p.id || null,
              name: p.name || "Desconhecido",
              image: p.image || getRandomImage(),
            }))
          : [];

        setParticipants(participantsList);
      } catch (error) {
        console.error(
          "Erro ao buscar detalhes da equipa:",
          error.response?.data || error.message
        );
        setTeamDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [user, accessToken, teamId]);

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
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            accessibilityLabel="Botão voltar atrás"
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
          <View style={styles.headerCenter}>
            <Text style={styles.competitionTitle}>
              {teamDetails.competition_name}
            </Text>
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
          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.info}>
          <Image
            source={require("../../imagens/1.png")}
            style={styles.teamImage}
          />
          <View style={styles.textContainer}>
            <View style={styles.teamRow}>
              <Text style={styles.labelnome}>{teamDetails.name}</Text>
              {isAdmin && (
                <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
                  <Svg width={10} height={6} viewBox="0 0 10 6" fill="none">
                    <Path d="M0 0L5 6L10 0" stroke="#263A83" strokeWidth={2} />
                  </Svg>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.labelpontos}>{teamDetails.pontos} pontos</Text>
          </View>
        </View>

        {showMenu && (
          <View style={styles.menuDropdown}>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleSettings}
            >
              <Text style={styles.menuOptionText}>Definições</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleDeleteTeam}
            >
              <Text style={[styles.menuOptionText, { color: "#D32F2F" }]}>
                Excluir equipa
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.desafioContainer}>
          <TouchableOpacity
            style={styles.desafioCard}
            onPress={() => handleCadernetaPress(teamId)}
          >
            <View style={styles.desafioIcon}>
              <Svg
                accessibilityLabel="Ilustração caderneta"
                width="40"
                height="40"
                viewBox="0 0 55 55"
                fill="none"
              >
                <Path
                  d="M25.2654 20.8129L25.2683 55.0055L9.66159 55.0074C4.50969 55.0074 0.299525 50.9754 0.0152943 45.8946L0 45.3463V20.8129H25.2654ZM29.7245 38.6494H54.9958L54.9982 45.3463C54.9976 50.6818 50.6722 55.0074 45.3365 55.0074L29.7275 55.0055L29.7245 38.6494ZM45.3384 0.000732422C50.4903 0.000732422 54.7005 4.03281 54.9847 9.11368L55 9.66193L54.9958 34.1903H29.7245L29.7275 0.000732422H45.3384ZM25.2683 0.000732422L25.2654 16.3538H0L0.00178536 9.66198C0.00240643 4.32641 4.32778 0.000732422 9.66335 0.000732422H25.2683Z"
                  fill="white"
                />
              </Svg>
            </View>
            <Text style={styles.desafioText}>Caderneta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.desafioCard}
            onPress={() => handleDesafioPress(teamId)}
          >
            <View style={styles.desafioIcon}>
              <Svg
                accessibilityLabel="Ilustração desafio semanal"
                width="45"
                height="45"
                viewBox="0 0 63 63"
                fill="none"
              >
                <Path
                  d="M55.1147 15.7471V29.1951C52.7034 28.1416 50.0406 27.5574 47.2411 27.5574C36.3702 27.5574 27.5573 36.3702 27.5573 47.2412C27.5573 50.0406 28.1416 52.7034 29.195 55.1147H9.84191C4.40638 55.1147 0 50.7083 0 45.2728V15.7471H55.1147Z"
                  fill="white"
                />
                <Path
                  d="M45.2728 0C50.7083 0 55.1147 4.40638 55.1147 9.8419V11.8103H0V9.8419C0 4.40638 4.40638 0 9.84191 0H45.2728Z"
                  fill="white"
                />
                <Path
                  d="M47.2471 35.4308C40.7211 35.4308 35.4309 40.7211 35.4309 47.247C35.4309 53.773 40.7211 59.0632 47.2471 59.0632C49.0576 59.0632 50.7512 58.6499 52.2987 57.9117C53.2798 57.4436 54.4549 57.8594 54.923 58.8408C55.3911 59.8218 54.975 60.9966 53.9939 61.4646C51.9436 62.4429 49.6729 63 47.2471 63C38.5468 63 31.4941 55.9473 31.4941 47.247C31.4941 38.5468 38.5468 31.4941 47.2471 31.4941C55.9422 31.4941 62.9918 38.5385 63 47.2313V47.2411V49.2016C63 52.466 60.3537 55.1127 57.089 55.1127C55.2832 55.1127 53.6664 54.3029 52.5822 53.0262C51.1783 54.3226 49.3025 55.1146 47.2412 55.1146C42.8926 55.1146 39.3677 51.5897 39.3677 47.2411C39.3677 42.8926 42.8926 39.3676 47.2412 39.3676C48.9572 39.3676 50.5453 39.9168 51.8389 40.8486C52.1865 40.5396 52.6444 40.3518 53.1463 40.3518C54.2333 40.3518 55.1147 41.2332 55.1147 42.3202V49.2016C55.1147 50.2921 55.9985 51.1759 57.089 51.1759C58.1795 51.1759 59.0633 50.2921 59.0633 49.2016V47.247C59.0633 40.7211 53.7731 35.4308 47.2471 35.4308ZM43.3044 47.2411C43.3044 49.4154 45.0669 51.1779 47.2412 51.1779C49.4155 51.1779 51.1779 49.4154 51.1779 47.2411C51.1779 45.0669 49.4155 43.3044 47.2412 43.3044C45.0669 43.3044 43.3044 45.0669 43.3044 47.2411Z"
                  fill="white"
                />
              </Svg>
            </View>
            <Text style={styles.desafioText}>Desafio Semanal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.remainingTeamsContainer}>
          {participants.map((item, index) => (
            <View key={index} style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.peopleImage} />
              <Text style={styles.participantText}>{item.name}</Text>
              {isAdmin && item.id && item.id != teamDetails.team_admin?.id && (
                <TouchableOpacity
                  style={styles.trashButton}
                  onPress={() => handleRemoveParticipant(item.id, item.name)}
                  accessibilityLabel={`Remover ${item.name} da equipa`}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
                      fill="#D32F2F"
                    />
                  </Svg>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal Personalizado */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelRemoveParticipant}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedParticipant?.error ? (
              <>
                <Text style={styles.modalTitle}>Erro</Text>
                <Text style={styles.modalMessage}>
                  {selectedParticipant.error}
                </Text>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={cancelRemoveParticipant}
                >
                  <Text style={styles.modalButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Confirmar remoção</Text>
                <Text style={styles.modalMessage}>
                  Tens a certeza que queres remover {selectedParticipant?.name}{" "}
                  da tua equipa?
                </Text>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={cancelRemoveParticipant}
                  >
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={confirmRemoveParticipant}
                  >
                    <Text style={styles.modalButtonText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 0,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: height * 0.05,
    marginBottom: height * 0.02,
  },
  backButton: {
    padding: width * 0.02,
  },
  backButtonPlaceholder: {
    width: 36,
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
    backgroundColor: "#E3FC87",
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
  info: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 20,
    zIndex: 998,
    position: "relative",
  },
  teamImage: {
    width: 90,
    height: 90,
    marginLeft: 10,
  },
  textContainer: {
    marginLeft: 15,
    flex: 1,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  labelnome: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263A83",
  },
  labelpontos: {
    fontSize: 14,
    color: "#263A83",
    marginTop: 3,
  },
  menuButton: {
    paddingHorizontal: 5,
  },
  menuDropdown: {
    position: "absolute",
    top: height * 0.15,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000,
  },
  menuOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  menuOptionText: {
    fontSize: 16,
    color: "#263A83",
  },
  desafioContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: width * 0.05,
    marginBottom: height * 0.03,
  },
  desafioCard: {
    backgroundColor: "#263A83",
    borderRadius: 15,
    padding: width * 0.07,
    alignItems: "center",
    width: width * 0.4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  desafioIcon: {
    marginBottom: height * 0.01,
  },
  desafioText: {
    fontSize: width * 0.035,
    fontWeight: 400,
    color: "#FFFFFF",
    textAlign: "center",
  },
  remainingTeamsContainer: {
    backgroundColor: "#D2E9FF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    width: 370,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  peopleImage: {
    width: 60,
    height: 60,
  },
  card: {
    flexDirection: "row",
    padding: 15,
    width: 330,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    height: 75,
  },
  participantText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#263A83",
    fontWeight: "500",
    flex: 1,
  },
  trashButton: {
    padding: 5,
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: width * 0.8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: "#263A83",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#D32F2F",
  },
  cancelButton: {
    backgroundColor: "#263A83",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DetalhesEquipa;
