import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Alert, TouchableOpacity } from "react-native";
import { auth } from "./firebase/firebaseApi";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseurl } from "./api-config/apiConfig"; 
import jwtDecode from "jwt-decode";

const ProfileScreen = () => {
  //const jwtDecode = require("jwt-decode");

  const [userId, setUserId] = useState(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Função para buscar o ID do participante a partir do token
  useEffect(() => {
    const getUserIdFromToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
  
        if (token) {
          
          const decodedToken = jwtDecode(token);
          console.log("decodedToken:", decodedToken);
  
          // Verifique se o token contém o campo id
          if (decodedToken && decodedToken.id) {
            setUserId(decodedToken.id);
          } else {
            Alert.alert("Erro", "ID do usuário não encontrado no token.");
          }
        } else {
          Alert.alert("Erro", "Token não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao obter ID do token:", error);
        Alert.alert("Erro", "Falha ao decodificar o token.");
      }
    };
  
    getUserIdFromToken();
  }, []);
  
  
  // Carregar dados do usuário apenas quando o userId mudar
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
  
        const token = await AsyncStorage.getItem("token");
  
        const response = await axios.get(`${baseurl}participants/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.data) {
          const { fullName, username, image } = response.data;
          setName(fullName || "");
          setUsername(username || "");
          setProfileImage(image || null);
        }
      } catch (error) {
        console.error("Erro ao carregar os dados do usuário:", error);
        Alert.alert("Erro", "Falha ao carregar dados do usuário.");
      } finally {
        setIsLoading(false);
      }
    };
  
    if (userId) {
      loadUserData();
    }
  }, [userId]);
  

  // Logout do usuário
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token"); // Remover o token do armazenamento
      auth.signOut();
      router.replace("./components/entrar/login");
    } catch (error) {
      console.error("Erro ao terminar sessão:", error);
      Alert.alert("Erro", "Não foi possível terminar a sessão.");
    }
  };

  // Renderizar o conteúdo do perfil
  if (isLoading) {
    return <LoadingText>Carregando...</LoadingText>;
  }

  return (
    <Container>
      <Header>
        <BackButton onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#263A83" />
        </BackButton>
        <HeaderTitle>Perfil</HeaderTitle>
      </Header>

      <AvatarContainer>
        {/* <Avatar
          accessibilityLabel="Imagem de perfil do utilizador"
          source={profileImage ? { uri: profileImage } : require("./default-avatar.png")} // Imagem padrão se não houver imagem
        /> */}
        <LevelText>Nível 1</LevelText>
        <Stars>
          <Icon name="star" size={20} color="#263A83" />
          <Icon name="star" size={20} color="#ccc" />
          <Icon name="star" size={20} color="#ccc" />
        </Stars>
      </AvatarContainer>

      <Form>
        <Row>
          <Label>Nome</Label>
          <InputRow>
            <Input value={name} editable={false} />
          </InputRow>
        </Row>

        <Row>
          <Label>Nome de Utilizador</Label>
          <InputRow>
            <Input value={username} editable={false} />
          </InputRow>
        </Row>

        <LogoutButton onPress={handleLogout}>
          <LogoutText>Terminar Sessão</LogoutText>
        </LogoutButton>
      </Form>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: #f9f9f9;
  padding: 16px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

const BackButton = styled(TouchableOpacity)`
  position: absolute;
  top: 40px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: transparent;
  border: 2px solid #263a83;
  justify-content: center;
  align-items: center;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #263a83;
`;

const AvatarContainer = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

const Avatar = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
`;

const LevelText = styled.Text`
  margin-top: 8px;
  font-size: 16px;
  color: #263a83;
`;

const Stars = styled.View`
  flex-direction: row;
  margin-top: 4px;
`;

const Form = styled.View`
  flex: 1;
`;

const Row = styled.View`
  margin-bottom: 20px;
`;

const Label = styled.Text`
  font-size: 14px;
  color: #263a83;
  margin-bottom: 4px;
`;

const InputRow = styled.View`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #263a83;
  padding-bottom: 4px;
`;

const Input = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: #333;
`;

const LogoutButton = styled.TouchableOpacity`
  margin-top: 40px;
  background-color: #263a83;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
`;

const LogoutText = styled.Text`
  font-size: 16px;
  color: #fff;
`;

const LoadingText = styled.Text`
  text-align: center;
  font-size: 18px;
  color: #263a83;
`;

export default ProfileScreen;
