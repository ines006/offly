import styled from "styled-components/native";
import React, { useState, useEffect } from "react";
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
  DesafioContainer,
  DesafioCard,
  DesafioIcon,
  DesafioText,
  ProfileContainer,
  Avatar,
  ProfileTextContainer,
  UserName,
  UserLevel,
  StarsContainer,
  Star,
} from "../../styles/styles.js";

export default function Home() {
  const router = useRouter();

  // Estado do contador
  const [timeLeft, setTimeLeft] = useState(11 * 60 * 60 + 23 * 60); // Tempo inicial: 11h 23m em segundos

  // Atualizar o contador a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Converter tempo para formato hh:mm:ss
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <ProfileContainer>
        <Avatar
          source={{
            uri: "https://celina05.sirv.com/equipas/participante1.png",
          }}
        />
        <ProfileTextContainer>
          <UserName>Pedro Martins</UserName> <UserLevel>Nível 1</UserLevel>
          <StarsContainer>
            {/* Estrelas */}
          </StarsContainer>
        </ProfileTextContainer>
      </ProfileContainer>

      <TittleTorneio>Torneio XPTO</TittleTorneio>
      <CardContainer>
        <Header>
          <IconContainer>
            <FontAwesome name="plane" size={20} color="#34459E" />
          </IconContainer>
          <TeamName>Equipa K</TeamName>
          <Points>
            <FontAwesome name="star" size={12} color="#D4F34A" /> 1200 pontos
          </Points>
        </Header>

        <Stats>
          <StatItem>
            <StatText>Dias em competição</StatText>
            <StatValue>
              9/30 <FontAwesome name="calendar" size={14} color="#ffffff" />
            </StatValue>
          </StatItem>
          <StatItem>
            <StatText>Desafios completos</StatText>
            <StatValue>
              7/30 <FontAwesome name="image" size={14} color="#ffffff" />
            </StatValue>
          </StatItem>
        </Stats>

        <Footer>
          <FooterText>5/5</FooterText>
          <FontAwesome name="group" size={16} color="#ffffff" />
        </Footer>

        {/* Novo botão com contador */}
        <CountdownButton>
          <FontAwesome name="clock-o" size={20} color="#ffffff" />
          <CountdownText>{formatTime(timeLeft)}</CountdownText>
        </CountdownButton>
      </CardContainer>

      <TittleTorneio>Desafios</TittleTorneio>
      <DesafioContainer>
        <DesafioCard onPress={() => handleDesafioPress(1)}>
          <DesafioIcon>
            <Svg width="55" height="55" viewBox="0 0 55 55" fill="none">
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
            <Svg width="63" height="63" viewBox="0 0 63 63" fill="none">
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
  font-size: 10px;
  font-weight: bold;
  margin-top: 4px;
`;
