import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components/native";
import { useRouter } from "expo-router";
import axios from "axios";
import { baseurl } from "./api-config/apiConfig"; 
import { Alert, TouchableOpacity, Text, View } from "react-native"; 
import imgParticipant from "./imagens/2.png"
import {AuthContext} from "./components/entrar/AuthContext"

const EcraParticipantes = () => {
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const { user, accessToken } = useContext(AuthContext);

  useEffect(() => {
    const getData = async () => {
      if (!user || !user.id) return;
  
      try {
        setIsLoading(true);
        setError(null);
  
        const response = await axios.get(`${baseurl}/participants/${user.id}/answers`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log("resposta: ", response.data)
        console.log("array answers: ", response.data.answers)
         
    setAnswers(response.data.answers);

  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
    setError("Falha ao carregar dados");
    Alert.alert("Erro", "Falha ao carregar dados");
  } finally {
    setIsLoading(false);
  }
    };
  
    if (user?.id) {
      getData();
    }
  }, [user]);
  

  if (isLoading) {
    return <LoadingText>Carregando...</LoadingText>;
  }

  if (error) {
    return <ErrorText>{error}</ErrorText>;
  }

  return (
    <Container>
      <Header>
        <HeaderTitle>Respostas do Participante</HeaderTitle>
      </Header>
  
      {answers ? (
      //{answers.length > 0 ? (
      // answers.map((resposta, index) => (
      //   <View key={index}>
      //       <Text>Resposta {index + 1}</Text>
      //       <Text>{resposta}</Text>
      //   </View>
      // ))
      <Text>{answers}</Text>
    ) : (
      <Text>Sem respostas disponíveis.</Text>
    )}
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
