import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components/native";
import { AuthContext } from "./components/entrar/AuthContext";
import axios from "axios";
import { Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { baseurl } from "./api-config/apiConfig";
import Icon from "react-native-vector-icons/MaterialIcons";

const ProfileScreen = () => {
  const { user, accessToken, loading } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);

        if (!accessToken || !user?.id) {
          console.warn("❗ Token ou ID do utilizador não está disponível.");
          return;
        }

        const url = `${baseurl}/participants/${user.id}`;
        const headers = { Authorization: `Bearer ${accessToken}` };

        console.log("🔐 Token usado na API:", accessToken);
        console.log("📡 URL da requisição:", url);
        console.log("👤 Utilizador logado via contexto:", user);

        const response = await axios.get(url, { headers });

        console.log("📥 Dados recebidos:", response.data);
        setProfileData(response.data);
      } catch (error) {
        console.error("❌ Erro ao carregar dados do perfil:", error.message);
        if (error.response) {
          console.log("📡 Status:", error.response.status);
          console.log("📡 Data:", error.response.data);
        }
        Alert.alert("Erro", "Falha ao carregar dados do perfil.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user && accessToken) {
      fetchUserProfile();
    }
  }, [user, accessToken, loading]);

  if (loading || isLoading) {
    return <LoadingText>A carregar...</LoadingText>;
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
            <Input value={profileData?.name || ""} editable={false} />
          </InputRow>
        </Row>

        <Row>
          <Label>Nome de Utilizador</Label>
          <InputRow>
            <Input value={profileData?.username || ""} editable={false} />
          </InputRow>
        </Row>
      </Form>
    </Container>
  );
};

// Estilos (mantive como no teu código)
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
