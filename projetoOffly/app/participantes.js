import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import { useRouter } from "expo-router";
import axios from "axios";
import { baseurl } from "./api-config/apiConfig"; 
import { Alert, TouchableOpacity } from "react-native"; 
import imgParticipant from "./imagens/2.png"

const EcraParticipantes = () => {
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const router = useRouter();

  // Função para buscar os particiantes
  useEffect(() => {
    const getParticipants = async () => {
      try {
        setIsLoading(true);
        setError(null); // Resetando erro ao fazer a requisição
        
        const response = await axios.get(`${baseurl}/participants`);
    
        if (response.data) {
          console.log("Dados Participantes: ", response.data)
          setParticipants(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
        setError("Falha ao carregar dados, tente novamente mais tarde."); 
        Alert.alert("Erro", "Falha ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };
  
    getParticipants();
  }, []);

  if (isLoading) {
    return <LoadingText>Carregando...</LoadingText>;
  }

  if (error) {
    return <ErrorText>{error}</ErrorText>;
  }

  return (
    <Container>
      <Header>
        <HeaderTitle>Participantes</HeaderTitle>
      </Header>

      {/* Exibindo os participantes */}
      <ParticipantsList
        data={participants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ParticipantItem>
            <Avatar source={imgParticipant} />
            <ParticipantInfo>
              <ParticipantName>{item.name}</ParticipantName>
              <ParticipantUsername>@{item.username}</ParticipantUsername>
            </ParticipantInfo>
          </ParticipantItem>
        )}
      />
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: #f5f7fb;
  padding: 16px;
`;

const Header = styled.View`
  padding: 20px 0;
  align-items: center;
  margin-bottom: 20px;
  background-color: #263a83;
  border-radius: 10px;
`;

const HeaderTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: white;
`;

const ParticipantsList = styled.FlatList`
  margin-top: 20px;
  padding-bottom: 20px;
`;

const ParticipantItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #fff;
  border-radius: 12px;
  border: 1px solid #ddd;
  shadow-color: #000;
  shadow-offset: 0px 4px; /* Corrigido aqui */
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  elevation: 5;
`;

const Avatar = styled.Image`
  width: 55px;
  height: 55px;
  border-radius: 27px;
  margin-right: 16px;
`;

const ParticipantInfo = styled.View`
  flex-direction: column;
`;

const ParticipantName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #263a83;
`;

const ParticipantUsername = styled.Text`
  font-size: 14px;
  color: #777;
`;

const LoadingText = styled.Text`
  text-align: center;
  font-size: 18px;
  color: #263a83;
`;

const ErrorText = styled.Text`
  text-align: center;
  font-size: 18px;
  color: red;
`;

export default EcraParticipantes;
