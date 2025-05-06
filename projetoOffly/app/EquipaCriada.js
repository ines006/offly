import { useFonts } from "expo-font";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { Alert } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import React, { useState, useEffect, useContext } from "react";
import {
  Container_Pagina_Equipa_Criada,
  Sub_Titulos_Criar_Equipa,
  Titulos_Equipa_Criada,
  Caixa_Equipa_Criada,
  Botoes_Pagina_principal,
  Texto_Botoes_Pagina_principal,
  Botoes_Pagina_principal_Desativado,
  Texto_Botoes_Pagina_principal_Desativado,
} from "./styles/styles";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase/firebaseApi";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AuthContext } from "./components/entrar/AuthContext"; 
import { baseurl } from "./api-config/apiConfig"; 
import axios from "axios";

export default function EquipaCriada() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  const { user, accessToken } = useContext(AuthContext); 
  
  const { teamId } = useLocalSearchParams();
  
  //const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamCapacity, setteamCapacity] = useState();

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
      console.log("🔍 Depurando dados do utilizador...");
      console.log("👤 User:", user);
      console.log("🔑 AccessToken:", accessToken);

      if (!user?.id || !accessToken) {
        console.error("❌ user.id ou accessToken estão indefinidos");
        Alert.alert("Erro", "Sessão inválida. Faça login novamente.");
        router.push("./login");
        return;
      }

      try {
        console.log(
          `🌐 Fazendo requisição para ${baseurl}/participants/${user.id}`
        );
        const response = await axios.get(`${baseurl}/participants/${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        console.log("✅ Resposta da API:", response.data);

        const userData = response.data;
        const name = userData.name || userData.fullName;
        const image = userData.image || null;
        
        setUserId(user.id);
        setUserName(name);
        setProfileImage(image ? { uri: image } : null);

        console.log("✅ Dados processados:", { name, image });
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
    //setLoading(true);
    try {
      const response = await axios.get(`${baseurl}/teams/${teamId}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("✅ Resposta da API:", response.data);

      const teamData = response.data;
      const name = teamData.name;
      const members = teamData.participants;
      const capacity = teamData.capacity;
      const description = teamData.description;

      setTeamName(name);
      setTeamMembers(members);
      setteamCapacity(capacity);
      setTeamDescription(description);

      console.log("✅ Dados processados:", { name, description, capacity, members });

    } catch (error) {
      Alert.alert(
        "Erro",
        error.response?.data?.message ||
          "Não foi possível carregar os dados da equipa."
      );
    } 
    // finally {
    //   setLoading(false);
    // }
  };

  // 👇 Carrega os dados da equipa ao entrar
  useEffect(() => {
    teamData();
  }, [userId, teamId]);

  // 🔁 Atualização automática
  useEffect(() => {
    const intervalId = setInterval(() => {
      teamData();
    }, 10000); // 10 segundos

    return () => clearInterval(intervalId);
  }, [userId, teamId]);


  // if (loading) {
  //   return (
  //     <View style={styles.loaderContainer}>
  //       <ActivityIndicator size="large" color="#263A83" />
  //     </View>
  //   );
  // }

  if (!teamName && !teamDescription) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Detalhes da equipa não encontrados.
        </Text>
      </View>
    );
  }

  // Função para entrar no torneio
  const handleTorneio =  () => {
      router.push("./components/navbar");
  };

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
        <Titulos_Equipa_Criada accessibilityRole="text" accessibilityLabel={teamName}>
          {teamName}
        </Titulos_Equipa_Criada>
        <Sub_Titulos_Criar_Equipa accessibilityRole="text" accessibilityLabel={teamDescription}>
          {teamDescription}
        </Sub_Titulos_Criar_Equipa>


        <View style={styles.remainingTeamsContainer}>
        {Array.from({ length: teamCapacity }).map((_, index) => {
            const participant = teamMembers[index];
            const isEmptySlot = !participant;

            return (
              <View key={index} style={[styles.card, isEmptySlot && styles.cardVazio]}>
                <Image
                  source={{
                    uri: isEmptySlot
                      ? "https://celina05.sirv.com/icones/empty-user.png"
                      : participant.image || getRandomImage(),
                  }}
                  style={styles.peopleImage}
                />
                <Text style={[styles.participantText, isEmptySlot && styles.participantTextVazio]}>
                  {isEmptySlot ? ". . ." : participant.name}
                </Text>
              </View>
            );
          })}

          {teamMembers.length === teamCapacity ? (
            <Botoes_Pagina_principal onPress={handleTorneio}>
              <Texto_Botoes_Pagina_principal>Entrar Torneio</Texto_Botoes_Pagina_principal>
            </Botoes_Pagina_principal>
          ) : (
            <Botoes_Pagina_principal_Desativado>
              <Texto_Botoes_Pagina_principal_Desativado>
                Entrar Torneio
              </Texto_Botoes_Pagina_principal_Desativado>
            </Botoes_Pagina_principal_Desativado>
          )}
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
});
