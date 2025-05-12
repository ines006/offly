import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components/native";
import { Alert, TouchableOpacity, View, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Svg, Path } from "react-native-svg";
import {
  CardContainer,
  Header,
  IconContainer,
  TeamName,
  Points,
  Stats,
  StatItem,
  StatText,
  StatValue,
  Footer,
  FooterText,
  BottomCircle,
  TittleTorneio,
  TittlePagina,
  DesafioContainer,
  DesafioCard,
  DesafioIcon,
  DesafioText,
  ProfileContainer,
  Avatar,
  TeamImage,
  ProfileTextContainer,
  UserName,
  UserLevel,
  StarsContainer,
  Star,
} from "../../styles/styles.js";
import { auth, db } from "../../firebase/firebaseApi";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AuthContext } from "../entrar/AuthContext"; 
import { baseurl } from "../../api-config/apiConfig"; 
import axios from "axios";

export default function Home() {
  const router = useRouter();

  const { user, accessToken } = useContext(AuthContext); // acede ao utilizador logado

  const [userId, setUserId] = useState(null);
  const [isUploadedToday, setIsUploadedToday] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [userName, setUserName] = useState("");
  const [userLevel, setUserLevel] = useState();
  const [teamId, setTeamId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamPoints, setTeamPoints] = useState();
  const [teamMembers, setTeamMembers] = useState();
  const [teamCapacity, setteamCapacity] = useState();
  const [profileImage, setProfileImage] = useState(null);
  const [teamImage, setTeamImage] = useState(null);
  const [tournamentName, setTournamentName] = useState(null);
  const [tournamentStart, setTournamentStart] = useState(null);
  const [tournamentEnd, setTournamentEnd] = useState(null);
  const [competitionDay, setCompetitionDay] = useState(null);

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
        const name =
          userData.name || userData.fullName;
        const image = userData.image || null;
        const level = userData.level;
        const teamId = userData.teams_id;
        
        setUserId(user.id);

        setUserName(name);
        setUserLevel(level);
        setProfileImage(image ? { uri: image } : null);
        setTeamId(teamId);

        console.log("✅ Dados processados:", { name, image, level, teamId });
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

  // Dados da equipa + torneio 
  useEffect(() => {
    const teamData = async () => {
      try {
        console.log(
          `🌐 Fazendo requisição para ${baseurl}/teams/${teamId}`
        );
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
        const image = teamData.image || null;
        const capacity = teamData.capacity;
        const members = teamData.participants.length;
        const points = teamData.points;
        const tournament_name = teamData.competition_name;
        const tournament_start = teamData.competition_start_date;
        const tournament_end = teamData.competition_end_date;

        setTeamName(name);
        setTeamImage(image);
        setTeamMembers(members);
        setteamCapacity(capacity);
        setTeamPoints(points);
        setTournamentName(tournament_name);
        setTournamentStart(tournament_start);
        setTournamentEnd(tournament_end);

        console.log("✅ Dados processados:", { name, image, members, capacity, points, tournament_name, tournament_start, tournament_end });
      } catch (error) {
        console.error("❌ Erro ao buscar dados da equipa:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        Alert.alert(
          "Erro",
          error.response?.data?.message ||
            "Não foi possível carregar os dados da equipa."
        );
      }
    };

    teamData();
  }, [userId, teamId]);

  useEffect(() => {
    if (tournamentStart && tournamentEnd) {
      const day = getCompetitionDay(tournamentStart, tournamentEnd);
      setCompetitionDay(day);
      //console.log("dia da competição: ", day);
    }
  }, [tournamentStart, tournamentEnd]);

  useEffect(() => {
    const checkUploadStatus = async () => {
      try {
        if (!userId) return;

        const response = await axios.get(`${baseurl}/participants/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        setIsUploadedToday(response.data.upload || 0);
       
      } catch (error) {
        console.error("Erro ao verificar o status de upload:", error);
      }
    };

    checkUploadStatus();
  }, [userId]);


  const resetUploadStatus = async () => { 
    try {
      if (!userId) return;
    
      const updateUpload = {
        upload: 0,
      };
      const response = await axios.put(`${baseurl}/participants/${userId}`, updateUpload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      setIsUploadedToday(0);
      console.log("Status de upload redefinido.");

    } catch (error) {
      console.error("Erro ao redefinir o status de upload:", error);
    }
  };

  const calculateNextReset = () => {
    const now = new Date();
    const resetTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );

  // Definir o horário de reset simulado
  //const resetTime = new Date("2025-05-06T14:00:00");

    return resetTime.getTime() - now.getTime();
  };

  useEffect(() => {
    const timeUntilReset = calculateNextReset();
    setTimeRemaining(timeUntilReset);

    const timer = setTimeout(() => {
      resetUploadStatus();
      setTimeRemaining(calculateNextReset());
    }, timeUntilReset);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 1000, 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [userId]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getCompetitionDay = (start_date, end_date) => {
    const start = new Date(start_date);
    const end = new Date(end_date);
    const now = new Date();
  
    // Se hoje for antes do início da competição
    if (now < start) {
      return 0; // competição ainda não começou
    }
  
    // Se hoje for depois do fim da competição
    if (now > end) {
      const duration = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return duration; // último dia da competição
    }
  
    // Se estivermos dentro do intervalo
    const dayNumber = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
    return dayNumber;

  }

  
  const handleCirclePress = () => {
    router.push("../components/uploadScreenTime/UploadScreen");
  };

  const handleCadernetaPress = () => {
    router.push("../../components/caderneta/caderneta");
  };

  const handleDesafioPress = () => {
    router.push("../../components/desafio/verificarDesafio");
  };

  const handlePerfilPress = () => {
    router.push("../../perfil");
  };

 return (
    <>
      <View
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel="Título: Home Page"
      >
        <TittlePagina
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel="Título: Home Page"
        ></TittlePagina>
      </View>
      <ProfileContainer>
        <TouchableOpacity onPress={handlePerfilPress}>
          <Avatar source={profileImage} />
        </TouchableOpacity>
        <ProfileTextContainer>
          <UserName>{userName}</UserName> <UserLevel> Nível {userLevel} </UserLevel>
          {/* FAZER CONDIÇÃO PARA MOSTRAR ESTRELAS DO NÍVEL CORRETO */}
          <StarsContainer>
            <Svg
              accessibilityLabel="estrela nível 1"
              width="13"
              height="11"
              viewBox="0 0 13 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <Path
                d="M6.6912 0.0515331C6.7894 0.1 6.86889 0.179489 6.91736 0.277695L8.37335 3.22785L11.629 3.70093C11.9012 3.74048 12.0898 3.99317 12.0502 4.26533C12.0345 4.3737 11.9834 4.47387 11.905 4.55031L9.54918 6.84668L10.1053 10.0892C10.1518 10.3603 9.96976 10.6177 9.69869 10.6642C9.59076 10.6827 9.47973 10.6651 9.38279 10.6142L6.47081 9.08325L3.55884 10.6142C3.31541 10.7421 3.01432 10.6485 2.88635 10.4051C2.83538 10.3082 2.8178 10.1972 2.83631 10.0892L3.39245 6.84668L1.03661 4.55031C0.839673 4.35834 0.835643 4.04307 1.02761 3.84613C1.10405 3.76771 1.20421 3.71668 1.31259 3.70093L4.56828 3.22785L6.02427 0.277695C6.14598 0.0310749 6.44458 -0.0701811 6.6912 0.0515331Z"
                fill="#263A83"
              />
            </Svg>
            <Svg
              accessibilityLabel="estrela nível 2"
              width="13"
              height="11"
              viewBox="0 0 13 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <Path
                d="M6.6912 0.0515331C6.7894 0.1 6.86889 0.179489 6.91736 0.277695L8.37335 3.22785L11.629 3.70093C11.9012 3.74048 12.0898 3.99317 12.0502 4.26533C12.0345 4.3737 11.9834 4.47387 11.905 4.55031L9.54918 6.84668L10.1053 10.0892C10.1518 10.3603 9.96976 10.6177 9.69869 10.6642C9.59076 10.6827 9.47973 10.6651 9.38279 10.6142L6.47081 9.08325L3.55884 10.6142C3.31541 10.7421 3.01432 10.6485 2.88635 10.4051C2.83538 10.3082 2.8178 10.1972 2.83631 10.0892L3.39245 6.84668L1.03661 4.55031C0.839673 4.35834 0.835643 4.04307 1.02761 3.84613C1.10405 3.76771 1.20421 3.71668 1.31259 3.70093L4.56828 3.22785L6.02427 0.277695C6.14598 0.0310749 6.44458 -0.0701811 6.6912 0.0515331Z"
                fill="#BEC4DA"
              />
            </Svg>
            <Svg
              accessibilityLabel="estrela nível 3"
              width="13"
              height="11"
              viewBox="0 0 13 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <Path
                d="M6.6912 0.0515331C6.7894 0.1 6.86889 0.179489 6.91736 0.277695L8.37335 3.22785L11.629 3.70093C11.9012 3.74048 12.0898 3.99317 12.0502 4.26533C12.0345 4.3737 11.9834 4.47387 11.905 4.55031L9.54918 6.84668L10.1053 10.0892C10.1518 10.3603 9.96976 10.6177 9.69869 10.6642C9.59076 10.6827 9.47973 10.6651 9.38279 10.6142L6.47081 9.08325L3.55884 10.6142C3.31541 10.7421 3.01432 10.6485 2.88635 10.4051C2.83538 10.3082 2.8178 10.1972 2.83631 10.0892L3.39245 6.84668L1.03661 4.55031C0.839673 4.35834 0.835643 4.04307 1.02761 3.84613C1.10405 3.76771 1.20421 3.71668 1.31259 3.70093L4.56828 3.22785L6.02427 0.277695C6.14598 0.0310749 6.44458 -0.0701811 6.6912 0.0515331Z"
                fill="#BEC4DA"
              />
            </Svg>
            <Svg
              accessibilityLabel="estrela nível 4"
              width="13"
              height="11"
              viewBox="0 0 13 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <Path
                d="M6.6912 0.0515331C6.7894 0.1 6.86889 0.179489 6.91736 0.277695L8.37335 3.22785L11.629 3.70093C11.9012 3.74048 12.0898 3.99317 12.0502 4.26533C12.0345 4.3737 11.9834 4.47387 11.905 4.55031L9.54918 6.84668L10.1053 10.0892C10.1518 10.3603 9.96976 10.6177 9.69869 10.6642C9.59076 10.6827 9.47973 10.6651 9.38279 10.6142L6.47081 9.08325L3.55884 10.6142C3.31541 10.7421 3.01432 10.6485 2.88635 10.4051C2.83538 10.3082 2.8178 10.1972 2.83631 10.0892L3.39245 6.84668L1.03661 4.55031C0.839673 4.35834 0.835643 4.04307 1.02761 3.84613C1.10405 3.76771 1.20421 3.71668 1.31259 3.70093L4.56828 3.22785L6.02427 0.277695C6.14598 0.0310749 6.44458 -0.0701811 6.6912 0.0515331Z"
                fill="#BEC4DA"
              />
            </Svg>
          </StarsContainer>
        </ProfileTextContainer>
      </ProfileContainer>
      <TittleTorneio>{tournamentName}</TittleTorneio>

      <CardContainer accessible={true}>
        <View accessible={false} accessibilityRole="button">
          <CardContainer
            accessible={false}
            accessibilityLabel={`Cartão da equipe ${teamName}`}
          >
            <Header>
              {/* <IconContainer accessibilityLabel="Ícone de equipe">
                <FontAwesome
                  name="plane"
                  size={20}
                  color="#34459E"
                  accessible={false}
                />
              </IconContainer> */}

<IconContainer accessibilityLabel="Ícone de equipe">
                <TeamImage source={teamImage} />
</IconContainer>

              <TeamName accessibilityLabel={`Nome da equipe: ${teamName}`}>
                {teamName}
              </TeamName>

              <Points accessibilityLabel={`Pontos da equipe: ${teamPoints}`}>
                <FontAwesome
                  name="star"
                  size={12}
                  color="#D4F34A"
                  accessible={false}
                />
                {teamPoints}
              </Points>
            </Header>

            <View>
              <Stats accessibilityRole="summary">
                <StatItem accessible={true} >
                  <StatText
                    accessibilityLabel="Dias em competição"
                    accessibilityRole="button"
                  >
                    Dias em competição
                  </StatText>
                  <StatValue accessibilityLabel="quantidade de dias">
                    {competitionDay}/30 {" "}
                    <FontAwesome
                      name="calendar"
                      size={14}
                      color="#ffffff"
                      accessible={false}
                    />
                  </StatValue>
                </StatItem>

                <StatItem accessible={true} >
                  <StatText
                    accessibilityLabel="Desafios completos"
                    accessibilityRole="button"
                  >
                    Desafios completos
                  </StatText>
                  <StatValue accessibilityLabel="quantidade de desafios">
                    7/30{" "} {/* DESAFIOS AQUI!! */}
                    <FontAwesome
                      name="calendar"
                      size={14}
                      color="#ffffff"
                      accessible={false}
                    />
                  </StatValue>
                </StatItem>
              </Stats>
            </View>

            <View accessible={true}>
              <Footer
                accessible={true}
                accessibilityRole="summary"
                accessibilityLabel={`Membros da equipe: ${teamMembers} de ${teamCapacity}`}
              >
                <FooterText
                  accessible={true}
                  accessibilityLabel={`Membros da equipe: ${teamMembers}/${teamCapacity}`}
                >
                  {teamMembers}/{teamCapacity}
                </FooterText>

                <FontAwesome
                  name="group"
                  size={16}
                  color="#ffffff"
                  accessible={true}
                  accessibilityLabel="Ícone de grupo"
                />
              </Footer>
            </View>
          </CardContainer>
        </View>

        {isUploadedToday ? (
          <CountdownButton
            accessible={true}
            accessibilityLabel="Botão upload do tempo de ecrã desativado"
          >
            <FontAwesome name="clock-o" size={20} color="#ffffff" />
            <CountdownText>{formatTime(timeRemaining)}</CountdownText>
          </CountdownButton>
        ) : (
          <BottomCircle
            onPress={handleCirclePress}
            accessible={true}
            accessibilityLabel="Botão upload do tempo de ecrã ativo"
          >
            <FontAwesome name="image" size={20} color="#ffffff" />
          </BottomCircle>
        )}
      </CardContainer>

      <TittleTorneio>Desafios</TittleTorneio>
      <DesafioContainer>
        <DesafioCard onPress={() => handleCadernetaPress(1)}>
          <DesafioIcon>
            <Svg
              accessibilityLabel="Ilustração caderneta"
              width="55"
              height="55"
              viewBox="0 0 55 55"
              fill="none"
            >
              {" "}
              <Path
                d="M25.2654 20.8129L25.2683 55.0055L9.66159 55.0074C4.50969 55.0074 0.299525 50.9754 0.0152943 45.8946L0 45.3463V20.8129H25.2654ZM29.7245 38.6494H54.9958L54.9982 45.3463C54.9976 50.6818 50.6722 55.0074 45.3365 55.0074L29.7275 55.0055L29.7245 38.6494ZM45.3384 0.000732422C50.4903 0.000732422 54.7005 4.03281 54.9847 9.11368L55 9.66193L54.9958 34.1903H29.7245L29.7275 0.000732422H45.3384ZM25.2683 0.000732422L25.2654 16.3538H0L0.00178536 9.66198C0.00240643 4.32641 4.32778 0.000732422 9.66335 0.000732422H25.2683Z"
                fill="white"
              />{" "}
            </Svg>
          </DesafioIcon>
          <DesafioText>Caderneta</DesafioText>
        </DesafioCard>

        <DesafioCard onPress={() => handleDesafioPress(1)}>
          <DesafioIcon>
            <Svg
              accessibilityLabel="Ilustração desafio semanal"
              width="63"
              height="63"
              viewBox="0 0 63 63"
              fill="none"
            >
              {" "}
              <Path
                d="M55.1147 15.7471V29.1951C52.7034 28.1416 50.0406 27.5574 47.2411 27.5574C36.3702 27.5574 27.5573 36.3702 27.5573 47.2412C27.5573 50.0406 28.1416 52.7034 29.195 55.1147H9.84191C4.40638 55.1147 0 50.7083 0 45.2728V15.7471H55.1147Z"
                fill="white"
              />{" "}
              <Path
                d="M45.2728 0C50.7083 0 55.1147 4.40638 55.1147 9.8419V11.8103H0V9.8419C0 4.40638 4.40638 0 9.84191 0H45.2728Z"
                fill="white"
              />{" "}
              <Path
                d="M47.2471 35.4308C40.7211 35.4308 35.4309 40.7211 35.4309 47.247C35.4309 53.773 40.7211 59.0632 47.2471 59.0632C49.0576 59.0632 50.7512 58.6499 52.2987 57.9117C53.2798 57.4436 54.4549 57.8594 54.923 58.8408C55.3911 59.8218 54.975 60.9966 53.9939 61.4646C51.9436 62.4429 49.6729 63 47.2471 63C38.5468 63 31.4941 55.9473 31.4941 47.247C31.4941 38.5468 38.5468 31.4941 47.2471 31.4941C55.9422 31.4941 62.9918 38.5385 63 47.2313V47.2411V49.2016C63 52.466 60.3537 55.1127 57.089 55.1127C55.2832 55.1127 53.6664 54.3029 52.5822 53.0262C51.1783 54.3226 49.3025 55.1146 47.2412 55.1146C42.8926 55.1146 39.3677 51.5897 39.3677 47.2411C39.3677 42.8926 42.8926 39.3676 47.2412 39.3676C48.9572 39.3676 50.5453 39.9168 51.8389 40.8486C52.1865 40.5396 52.6444 40.3518 53.1463 40.3518C54.2333 40.3518 55.1147 41.2332 55.1147 42.3202V49.2016C55.1147 50.2921 55.9985 51.1759 57.089 51.1759C58.1795 51.1759 59.0633 50.2921 59.0633 49.2016V47.247C59.0633 40.7211 53.7731 35.4308 47.2471 35.4308ZM43.3044 47.2411C43.3044 49.4154 45.0669 51.1779 47.2412 51.1779C49.4155 51.1779 51.1779 49.4154 51.1779 47.2411C51.1779 45.0669 49.4155 43.3044 47.2412 43.3044C45.0669 43.3044 43.3044 45.0669 43.3044 47.2411Z"
                fill="white"
              />{" "}
            </Svg>
          </DesafioIcon>
          <DesafioText>Desafio Semanal</DesafioText>
        </DesafioCard>
      </DesafioContainer>
    </>
  );
}


// Styled Component para o botão
const CountdownButton = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: #6876a9;
  border-width: 4px;
  border-color: #ffffff;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: -32px;
  align-self: center;
`;

// Estilo do texto do contador
const CountdownText = styled.Text`
  color: #ffffff;
  font-size: 9px;
  font-weight: bold;
  margin-top: 4px;
`;

const TittleHomePage = styled.View`
  color: rgba(38, 58, 131, 1);
  font-size: 24px;
  text-align: center;
  margin-top: 20px;
  margin-bottom: -20px;
  font-weight: 600;
`;
