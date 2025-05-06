import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import styled from "styled-components/native";
import { AuthContext } from "./components/entrar/AuthContext"; // Ajuste o caminho se necessário
import axios from "axios";
import { Alert, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { baseurl } from "./api-config/apiConfig";
import Icon from "react-native-vector-icons/MaterialIcons";
import Svg, { Path } from "react-native-svg";

const ProfileScreen = () => {
  const { user, accessToken, refreshToken, loading, logout } =
    useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState("");
  const [editError, setEditError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  // Função para buscar dados do perfil
  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!accessToken || !user?.id) {
        throw new Error("Token ou ID do utilizador não disponível");
      }

      const url = `${baseurl}/participants/${user.id}`;
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "ngrok-skip-browser-warning": "true",
      };

      console.log("🔐 Token usado na API:", accessToken);
      console.log("📡 URL da requisição:", url);

      const response = await axios.get(url, { headers });

      console.log("📥 Dados recebidos (GET):", response.data);

      if (!response.data || typeof response.data !== "object") {
        throw new Error("Dados do perfil inválidos");
      }

      setProfileData(response.data);
    } catch (err) {
      console.error("❌ Erro ao carregar dados do perfil:", err.message);
      if (err.response) {
        console.log("📡 Status:", err.response.status);
        console.log("📡 Data:", err.response.data);
      }
      setError(
        "Não foi possível carregar os dados do perfil. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, accessToken]);

  // Função para salvar alterações
  const saveField = useCallback(
    async (field) => {
      try {
        setIsSaving(true);
        setEditError(null);

        // Validação básica
        if (!editedValue.trim()) {
          setEditError("O campo não pode estar vazio.");
          return;
        }
        if (
          field === "email" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedValue)
        ) {
          setEditError("Por favor, insira um email válido.");
          return;
        }
        if (field === "password" && editedValue.length < 6) {
          setEditError("A palavra-passe deve ter pelo menos 6 caracteres.");
          return;
        }

        const url = `${baseurl}/participants/${user.id}`;
        const headers = {
          Authorization: `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "true",
        };

        // Enviar todos os campos, atualizando apenas o campo editado
        const payload = {
          name: field === "name" ? editedValue : profileData?.name || "",
          username:
            field === "username" ? editedValue : profileData?.username || "",
          email: field === "email" ? editedValue : profileData?.email || "",
          password: field === "password" ? editedValue : undefined,
        };

        // Remover password do payload se não estiver sendo atualizado
        if (payload.password === undefined) {
          delete payload.password;
        }

        console.log("📤 Enviando dados (PUT):", payload);

        const response = await axios.put(url, payload, { headers });

        console.log("📥 Resposta do servidor (PUT):", response.data);

        // Validar a resposta
        if (!response.data || typeof response.data !== "object") {
          throw new Error("Resposta do servidor inválida");
        }

        // Recarregar os dados do perfil para garantir consistência
        await fetchUserProfile();

        setEditingField(null);
        setEditedValue("");
        Alert.alert("Sucesso", "Campo atualizado com sucesso!");
      } catch (err) {
        console.error("❌ Erro ao salvar campo:", err.message);
        if (err.response) {
          console.log("📡 Status:", err.response.status);
          console.log("📡 Data:", err.response.data);
          setEditError(
            err.response.data.message ||
              "Erro ao atualizar o campo. Verifique os dados e tente novamente."
          );
        } else {
          setEditError("Falha na conexão com o servidor. Tente novamente.");
        }
      } finally {
        setIsSaving(false);
      }
    },
    [accessToken, user?.id, editedValue, profileData, fetchUserProfile]
  );

  // Função para cancelar edição
  const cancelEdit = useCallback(() => {
    setEditingField(null);
    setEditedValue("");
    setEditError(null);
  }, []);

  // Função para iniciar edição
  const startEditing = useCallback((field, currentValue) => {
    setEditingField(field);
    setEditedValue(currentValue || "");
    setEditError(null);
  }, []);

  // Função de logout
  const handleLogout = useCallback(async () => {
    try {
      if (!refreshToken) {
        console.warn("⚠️ Refresh token não disponível");
        Alert.alert(
          "Erro",
          "Sessão inválida. Por favor, faça login novamente."
        );
        if (logout) {
          await logout();
          router.replace("/");
        }
        return;
      }

      const url = `${baseurl}/auth/logout`;
      const headers = {
        "ngrok-skip-browser-warning": "true",
      };

      console.log("📤 Enviando refreshToken para logout:", refreshToken);

      await axios.post(url, { refreshToken }, { headers });

      console.log("🔓 Sessão terminada com sucesso");

      if (logout) {
        await logout();
      } else {
        console.warn("⚠️ Função logout não definida no AuthContext");
      }

      router.replace("/");
    } catch (err) {
      console.error("❌ Erro ao terminar sessão:", err.message);
      if (err.response) {
        console.log("📡 Status:", err.response.status);
        console.log("📡 Data:", err.response.data);
      }
      Alert.alert("Erro", "Falha ao terminar a sessão. Tente novamente.");
    }
  }, [refreshToken, logout, router]);

  // Log para depurar o refreshToken
  useEffect(() => {
    console.log("🔍 Valor do refreshToken no ProfileScreen:", refreshToken);
  }, [refreshToken]);

  // Gerar estrelas com base no nível
  const stars = useMemo(() => {
    const userLevel = profileData?.level || 1;
    console.log("🔍 Gerando estrelas:", { userLevel });
    return Array.from({ length: 4 }, (_, index) => {
      const starLevel = index + 1;
      const starColor = starLevel <= userLevel ? "#263A83" : "#BEC4DA";

      return (
        <Svg
          key={`star-${starLevel}`}
          accessibilityLabel={`Estrela nível ${starLevel}`}
          width="13"
          height="11"
          viewBox="0 0 13 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Path
            d="M6.6912 0.0515331C6.7894 0.1 6.86889 0.179489 6.91736 0.277695L8.37335 3.22785L11.629 3.70093C11.9012 3.74048 12.0898 3.99317 12.0502 4.26533C12.0345 4.3737 11.9834 4.47387 11.905 4.55031L9.54918 6.84668L10.1053 10.0892C10.1518 10.3603 9.96976 10.6177 9.69869 10.6642C9.59076 10.6827 9.47973 10.6651 9.38279 10.6142L6.47081 9.08325L3.55884 10.6142C3.31541 10.7421 3.01432 10.6485 2.88635 10.4051C2.83538 10.3082 2.8178 10.1972 2.83631 10.0892L3.39245 6.84668L1.03661 4.55031C0.839673 4.35834 0.835643 4.04307 1.02761 3.84613C1.10405 3.76771 1.20421 3.71668 1.31259 3.70093L4.56828 3.22785L6.02427 0.277695C6.14598 0.0310749 6.44458 -0.0701811 6.6912 0.0515331Z"
            fill={starColor}
          />
        </Svg>
      );
    });
  }, [profileData?.level]);

  // Carregar dados do perfil
  useEffect(() => {
    if (!loading && user && accessToken) {
      fetchUserProfile();
    }
  }, [loading, user, accessToken, fetchUserProfile]);

  if (loading || isLoading) {
    return <LoadingText>A carregar...</LoadingText>;
  }


  return (
    <Container>
      <Header>
        <BackButton onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#263A83" />
        </BackButton>
      </Header>

      <AvatarContainer>
        {profileData?.image ? (
          <Avatar
            source={{ uri: profileData.image }}
            onError={() => console.warn("❌ Erro ao carregar imagem")}
          />
        ) : (
          <DefaultAvatar>
            <Icon name="person" size={50} color="#263A83" />
          </DefaultAvatar>
        )}
        <LevelText>Nível {profileData?.level || 1}</LevelText>
        <StarsContainer>{stars}</StarsContainer>
      </AvatarContainer>

      <Form>
        {editError && <ErrorText>{editError}</ErrorText>}
        <Row>
          <Label>Nome</Label>
          <InputRow>
            <Input
              value={
                editingField === "name" ? editedValue : profileData?.name || ""
              }
              editable={editingField === "name"}
              placeholder="Nome não disponível"
              placeholderTextColor="#999"
              onChangeText={(text) => setEditedValue(text)}
            />
            {editingField === "name" ? (
              <>
                <ActionButton
                  disabled={isSaving}
                  onPress={() => saveField("name")}
                >
                  <Icon
                    name="check"
                    size={20}
                    color={isSaving ? "#999" : "#263A83"}
                  />
                </ActionButton>
                <ActionButton disabled={isSaving} onPress={cancelEdit}>
                  <Icon
                    name="close"
                    size={20}
                    color={isSaving ? "#999" : "#d32f2f"}
                  />
                </ActionButton>
              </>
            ) : (
              <ActionButton
                disabled={isSaving}
                onPress={() => startEditing("name", profileData?.name || "")}
              >
                <Icon
                  name="edit"
                  size={20}
                  color={isSaving ? "#999" : "#263A83"}
                />
              </ActionButton>
            )}
          </InputRow>
        </Row>

        <Row>
          <Label>Nome de Utilizador</Label>
          <InputRow>
            <Input
              value={
                editingField === "username"
                  ? editedValue
                  : profileData?.username || ""
              }
              editable={editingField === "username"}
              placeholder="Utilizador não disponível"
              placeholderTextColor="#999"
              onChangeText={(text) => setEditedValue(text)}
            />
            {editingField === "username" ? (
              <>
                <ActionButton
                  disabled={isSaving}
                  onPress={() => saveField("username")}
                >
                  <Icon
                    name="check"
                    size={20}
                    color={isSaving ? "#999" : "#263A83"}
                  />
                </ActionButton>
                <ActionButton disabled={isSaving} onPress={cancelEdit}>
                  <Icon
                    name="close"
                    size={20}
                    color={isSaving ? "#999" : "#d32f2f"}
                  />
                </ActionButton>
              </>
            ) : (
              <ActionButton
                disabled={isSaving}
                onPress={() =>
                  startEditing("username", profileData?.username || "")
                }
              >
                <Icon
                  name="edit"
                  size={20}
                  color={isSaving ? "#999" : "#263A83"}
                />
              </ActionButton>
            )}
          </InputRow>
        </Row>

        <Row>
          <Label>Email</Label>
          <InputRow>
            <Input
              value={
                editingField === "email"
                  ? editedValue
                  : profileData?.email || ""
              }
              editable={editingField === "email"}
              placeholder="Email não disponível"
              placeholderTextColor="#999"
              onChangeText={(text) => setEditedValue(text)}
              keyboardType="email-address"
            />
            {editingField === "email" ? (
              <>
                <ActionButton
                  disabled={isSaving}
                  onPress={() => saveField("email")}
                >
                  <Icon
                    name="check"
                    size={20}
                    color={isSaving ? "#999" : "#263A83"}
                  />
                </ActionButton>
                <ActionButton disabled={isSaving} onPress={cancelEdit}>
                  <Icon
                    name="close"
                    size={20}
                    color={isSaving ? "#999" : "#d32f2f"}
                  />
                </ActionButton>
              </>
            ) : (
              <ActionButton
                disabled={isSaving}
                onPress={() => startEditing("email", profileData?.email || "")}
              >
                <Icon
                  name="edit"
                  size={20}
                  color={isSaving ? "#999" : "#263A83"}
                />
              </ActionButton>
            )}
          </InputRow>
        </Row>

        <Row>
          <Label>Palavra-passe</Label>
          <InputRow>
            <Input
              value={editingField === "password" ? editedValue : "********"}
              editable={editingField === "password"}
              placeholder="Alterar palavra-passe"
              placeholderTextColor="#999"
              onChangeText={(text) => setEditedValue(text)}
              secureTextEntry
            />
            {editingField === "password" ? (
              <>
                <ActionButton
                  disabled={isSaving}
                  onPress={() => saveField("password")}
                >
                  <Icon
                    name="check"
                    size={20}
                    color={isSaving ? "#999" : "#263A83"}
                  />
                </ActionButton>
                <ActionButton disabled={isSaving} onPress={cancelEdit}>
                  <Icon
                    name="close"
                    size={20}
                    color={isSaving ? "#999" : "#d32f2f"}
                  />
                </ActionButton>
              </>
            ) : (
              <ActionButton
                disabled={isSaving}
                onPress={() => startEditing("password", "")}
              >
                <Icon
                  name="edit"
                  size={20}
                  color={isSaving ? "#999" : "#263A83"}
                />
              </ActionButton>
            )}
          </InputRow>
        </Row>

        <Row>
          <Label>Email</Label>
          <InputRow>
            <Input value={profileData?.email || ""} editable={false} />
          </InputRow>
        </Row>

        <LogoutButton onPress={handleLogout}>
          <LogoutText>Terminar Sessão</LogoutText>
        </LogoutButton>
      </Form>

    </Container>
  );
};

// Estilos (mantidos iguais)
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

const AvatarContainer = styled.View`
  align-items: center;
  margin-bottom: 24px;
`;

const Avatar = styled.Image`
  margin-top: 50px;
  width: 160px;
  height: 160px;
  border-radius: 60px;
`;

const DefaultAvatar = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  justify-content: center;
  align-items: center;
  background-color: #e0e0e0;
`;

const LevelText = styled.Text`
  margin-top: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #263a83;
`;

const StarsContainer = styled.View`
  flex-direction: row;
  margin-top: 8px;
  gap: 4px;
`;

const Form = styled.View`
  flex: 1;
`;

const Row = styled.View`
  margin-bottom: 16px;
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: 630;
  color: #314aa5;
  margin-bottom: 6px;
`;

const InputRow = styled.View`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #314aa5;
  padding-bottom: 4px;
`;

const Input = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: #333;
  padding: 8px 0;
`;

const ActionButton = styled(TouchableOpacity)`
  padding: 8px;
`;

const LogoutButton = styled(TouchableOpacity)`
  margin-top: 32px;
  background-color: #263a83;
  padding: 14px;
  border-radius: 8px;
  align-items: center;
`;

const LogoutText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;

const LoadingText = styled.Text`
  flex: 1;
  text-align: center;
  font-size: 18px;
  color: #263a83;
`;

const ErrorContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 16px;
`;

const ErrorText = styled.Text`
  font-size: 14px;
  color: #d32f2f;
  text-align: center;
  margin-bottom: 8px;
`;

const RetryButton = styled.TouchableOpacity`
  background-color: #263a83;
  padding: 12px 24px;
  border-radius: 8px;
`;

const RetryButtonText = styled.Text`
  font-size: 16px;
  color: #fff;
`;

export default ProfileScreen;
