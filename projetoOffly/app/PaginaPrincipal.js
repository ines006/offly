import * as Clipboard from "expo-clipboard";
import { TextInput } from "react-native";
import { useFonts } from "expo-font";
import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Modal,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  AccessibilityInfo,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { useRouter } from "expo-router";
import Card_Equipa from "./components/Equipas-copy";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseurl } from "../app/api-config/apiConfig";
import { AuthContext } from "../app/components/entrar/AuthContext";

// Estilos
import {
  Container_Pagina_Principal,
  Sub_Titulos,
  Titulos,
  Botoes_Pagina_principal,
  Texto_Botoes_Pagina_principal,
  CaixaQuestionario,
  BotaoNavegacaoContainer,
  Texto_Botoes_Pagina_principal_Voltar,
  Texto_Botoes_Definir_Visibilidade,
  Caixa_de_texto,
  Titulos_Criar_Equipa,
  Definir_visibilidade_btn,
  SearchInput,
  SearchBarContainer,
  ProfileContainer,
  Avatar,
  ProfileTextContainer,
  UserName,
  UserLevel,
  StarsContainer,
} from "./styles/styles";

// Componente para os campos de texto de criação de equipa
function Caixas_de_Texto_Criar_Equipa(props) {
  const {
    titulo,
    placeholder,
    value,
    onChangeText,
    editable = true,
    error,
    onError,
    placeholderTextColor,
  } = props;

  return (
    <View style={styles.inputContainer}>
      <Titulos_Criar_Equipa accessibilityElementsHidden={true}>
        {titulo} <Text style={{ color: "#B30000" }}>*</Text>
      </Titulos_Criar_Equipa>
      <Caixa_de_texto
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        editable={editable}
        accessible={true}
        accessibilityLabel={
          value
            ? `${titulo} (obrigatório)`
            : `${titulo} (obrigatório), ${placeholder}`
        }
        accessibilityHint={`Insira ${titulo.toLowerCase()}`}
        accessibilityRole="textbox"
        accessibilityValue={{ text: value ? value : "campo vazio" }}
        placeholderTextColor={placeholderTextColor || "rgba(38, 58, 131, 0.5)"}
        autoCapitalize="sentences"
        returnKeyType="done"
        onBlur={() => {
          if (!value.trim()) {
            if (titulo === "Dá um nome à tua equipa") {
              onError("Tens de definir um nome para a tua equipa");
            } else if (titulo === "Adiciona uma descrição") {
              onError("A tua equipa deve ter uma descrição que a caraterize");
            }
          } else {
            onError("");
          }
        }}
      />
      {error ? (
        <Text
          style={styles.errorText}
          accessibilityLiveRegion="assertive"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export default function PaginaPrincipal() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  const { user, accessToken } = useContext(AuthContext);
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [userLevel, setUserLevel] = useState(1);

  const [equipas, setEquipas] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEquipa, setModalEquipa] = useState(false);
  const [selectedEquipaId, setSelectedEquipaId] = useState(null);

  const [NomeEquipa, setNomeEquipa] = useState("");
  const [DescricaoEquipa, setDescricaoEquipa] = useState("");
  const [activeButton, setActiveButton] = useState(null);
  const [selectedValue, setSelectedValue] = useState("3");
  const [nomeEquipaError, setNomeEquipaError] = useState("");
  const [descricaoEquipaError, setDescricaoEquipaError] = useState("");
  const [visibilidadeError, setVisibilidadeError] = useState("");
  const [inviteLink, setInviteLink] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const options = ["3", "4", "5"];
  const router = useRouter();

  const imageTeamUrls = [
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.50.14-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.51.27-removebg-preview.png",
    // ... restante das URLs ...
  ];

  const getRandomImage = (tipo) => {
    const randomIndex = Math.floor(Math.random() * tipo.length);
    return tipo[randomIndex];
  };

  // Buscar informações do utilizador
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
          userData.name || userData.fullName || "Nome não disponível";
        const image = userData.image || null;
        const level = userData.level;

        setUserName(name);
        setUserLevel(level);
        setProfileImage(image ? { uri: image } : null);

        console.log("✅ Dados processados:", { name, image, level });
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

  // Buscar equipas disponíveis
  const fetchEquipas = async (page = 1, search = "") => {
    setIsLoading(true);
    console.log("🔍 Depurando listagem de equipas...");
    console.log("👤 User ID:", user?.id);
    console.log("🔑 AccessToken:", accessToken);
    console.log("📄 Página atual:", page);
    console.log("🔎 Texto da pesquisa:", search);

    try {
      const endpoint = search.trim()
        ? `${baseurl}/teams/search?name=${encodeURIComponent(
            search
          )}&page=${page}`
        : `${baseurl}/teams?capacity=has-vacancy&page=${page}`;
      console.log(`🌐 Fazendo requisição para ${endpoint}`);

      const response = await axios.get(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("✅ Resposta da API:", response.data);

      // Normalizar a resposta
      let teams = [];
      let pagination = { totalPages: 1 };

      if (search.trim()) {
        teams =
          response.data.teams ||
          (Array.isArray(response.data) ? response.data : []);
        pagination = response.data.pagination || { totalPages: 1 };
      } else {
        teams = response.data.teams || [];
        pagination = response.data.pagination || { totalPages: 1 };
      }

      const formattedTeams = teams.map((team, index) => ({
        id: team.id || `team-${index}`,
        nome: team.name || "Equipa sem nome",
        imagem: team.image,
        currentParticipants:
          team.participant_count ??
          (Array.isArray(team.participants) ? team.participants.length : 0),
        numparticipantes: team.capacity ?? 5,
      }));

      setEquipas(formattedTeams);
      setTotalPages(pagination.totalPages || 1);
      setCurrentPage(page);

      console.log("✅ Equipas processadas:", formattedTeams);
      console.log("📄 Total de páginas:", pagination.totalPages);
    } catch (error) {
      console.error("❌ Erro ao buscar equipas:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setEquipas([]);
      setTotalPages(1);
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível carregar as equipas."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect para buscar equipas
  useEffect(() => {
    if (accessToken && user?.id) {
      console.log("🔄 useEffect disparado:", { currentPage, searchText });
      const debounce = setTimeout(
        () => {
          console.log(
            "🔄 Buscando equipas para página:",
            currentPage,
            "Pesquisa:",
            searchText
          );
          fetchEquipas(currentPage, searchText);
        },
        searchText ? 500 : 0
      );

      return () => clearTimeout(debounce);
    } else {
      console.error("❌ accessToken ou user.id não estão definidos");
      Alert.alert("Erro", "Sessão inválida. Faça login novamente.");
      router.push("./login");
    }
  }, [accessToken, user, currentPage, searchText]);

  // Reiniciar página quando searchText muda
  useEffect(() => {
    console.log(
      "🔄 Reiniciando página devido a mudança em searchText:",
      searchText
    );
    setCurrentPage(1);
  }, [searchText]);

  // Criar equipa
  const criarEquipa = async () => {
    try {
      console.log("🔄 Criando equipa...");
      const equipaData = {
        name: NomeEquipa,
        description: DescricaoEquipa,
        capacity: parseInt(selectedValue),
        visibility: activeButton === "public" ? 1 : 0,
        image: getRandomImage(imageTeamUrls),
        competitions_id: 1, // Ajuste conforme necessário
        team_passbooks_id: 1, // Ajuste conforme necessário
        team_admin: 1, // Ajuste conforme necessário (ex.: ID do usuário logado)
      };

      // Criar a equipa
      const response = await axios.post(`${baseurl}/teams`, equipaData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const teamId = response.data.id;
      console.log("✅ Equipa criada com ID:", teamId);

      // Fechar o modal
      if (typeof setModalVisible === "function") {
        setModalVisible(false);
      } else {
        console.warn(
          "⚠️ setModalVisible não é uma função ou não está definido. Modal não será fechado."
        );
      }

      // Redirecionar para a página EquipaCriada
      router.push({
        pathname: "/EquipaCriada",
        params: { teamId },
      });
    } catch (error) {
      console.error("❌ Erro ao criar equipa:", error);
      let errorMessage = "Não foi possível criar a equipa.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      Alert.alert("Erro", errorMessage);
    }
  };

  // Entrar numa equipa
  const handleEntrarnaEquipa = async () => {
    if (!user?.id) {
      console.warn("⚠️ Utilizador não autenticado ou ID não disponível.");
      Alert.alert(
        "Erro",
        "Você precisa estar autenticado para entrar numa equipa."
      );
      return;
    }
    if (!selectedEquipaId) {
      console.warn("⚠️ Nenhuma equipa selecionada.");
      Alert.alert("Erro", "Selecione uma equipa para entrar.");
      return;
    }
    if (!accessToken) {
      console.warn("⚠️ Token de acesso não disponível.");
      Alert.alert("Erro", "Token de autenticação não encontrado.");
      return;
    }

    try {
      console.log("🔄 Entrando na equipa:", selectedEquipaId);
      const response = await axios.post(
        `${baseurl}/teams/${selectedEquipaId}/join`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("✅ Sucesso:", response.data);
      Alert.alert("Sucesso", "Você entrou na equipa com sucesso!");

      // Fechar o modal
      if (typeof setModalEquipa === "function") {
        setModalEquipa(false);
      } else {
        console.warn(
          "⚠️ setModalEquipa não é uma função ou não está definido."
        );
      }

      // Redirecionar
      router.push({
        pathname: "/EquipaCriada",
        params: { teamId: selectedEquipaId },
      });
    } catch (error) {
      console.error("❌ Erro ao entrar na equipa:", error);
      let errorMessage = "Não foi possível entrar na equipa.";
      if (error.response) {
        errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          errorMessage;
        console.log("Resposta do backend:", error.response.data);
      }
      if (error.response?.status === 403) {
        errorMessage =
          error.response.data.message ||
          "Acesso negado: equipa privada ou sem permissão.";
      } else if (error.response?.status === 404) {
        errorMessage = error.response.data.message || "Equipa não encontrada.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response.data.message ||
          "A equipa está cheia ou você já está associado.";
      } else if (error.response?.status === 401) {
        errorMessage =
          error.response.data.message || "Token inválido ou expirado.";
      }
      Alert.alert("Erro", errorMessage);
    }
  };

  const validateForm = () => {
    let isValid = true;
    let errorMessages = [];

    if (!NomeEquipa.trim()) {
      setNomeEquipaError("Tens de definir um nome para a tua equipa");
      errorMessages.push("Tens de definir um nome para a tua equipa");
      isValid = false;
    } else {
      setNomeEquipaError("");
    }

    if (!DescricaoEquipa.trim()) {
      setDescricaoEquipaError(
        "A tua equipa deve ter uma descrição que a caraterize"
      );
      errorMessages.push(
        "A tua equipa deve ter uma descrição que a caraterize"
      );
      isValid = false;
    } else {
      setDescricaoEquipaError("");
    }

    if (!activeButton) {
      setVisibilidadeError(
        "Tens de definir a visibilidade da tua equipa para os outros utilizadores"
      );
      errorMessages.push(
        "Tens de definir a visibilidade da tua equipa para os outros utilizadores"
      );
      isValid = false;
    } else {
      setVisibilidadeError("");
    }

    return { isValid, errorMessages };
  };

  const handleNext = () => {
    const { isValid, errorMessages } = validateForm();
    if (isValid) {
      criarEquipa();
    } else {
      setTimeout(() => {
        if (errorMessages.length > 0) {
          const announcement = errorMessages.join(". ");
          console.log("Anunciando erros:", announcement);
          AccessibilityInfo.announceForAccessibility(announcement);
        }
      }, 100);
    }
  };

  const handleNext2 = () => {
    handleEntrarnaEquipa();
  };

  const handleButtonClick = (button) => {
    setActiveButton(button);
    if (button) {
      setVisibilidadeError("");
    }

    if (button === "private") {
      const generatedInviteCode = generateInviteCode();
      const inviteUrl = `https://offly/join-team?invitecode=${generatedInviteCode}`;
      setInviteLink(inviteUrl);
    } else {
      setInviteLink(null);
    }
  };

  const handlePerfil = () => {
    router.push("./perfil");
  };

  const Criar_Equipa = () => {
    setModalVisible(true);
  };

  const handleModalEquipa = (id) => {
    setSelectedEquipaId(id);
    setModalEquipa(true);
  };

  const SearchIcon = () => (
    <Svg
      accessibilityLabel="ilustração lupa de pesquisa"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="#263A83"
    >
      <Path
        d="M10.5 2a8.5 8.5 0 1 0 5.53 15.03l3.7 3.7a1.5 1.5 0 1 0 2.12-2.12l-3.7-3.7A8.5 8.5 0 0 0 10.5 2zm0 3a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z"
        fill="#1a237e"
      />
    </Svg>
  );

  function generateInviteCode() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let inviteCode = "";
    for (let i = 0; i < 8; i++) {
      inviteCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return inviteCode;
  }

  function copyToClipboard(text) {
    Clipboard.setStringAsync(text);
    Alert.alert("Sucesso", "Link copiado para a área de transferência!");
  }

  // Memoizar as estrelas para evitar renderizações desnecessárias
  const stars = useMemo(() => {
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
  }, [userLevel]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <ProfileContainer
        style={{ backgroundColor: "#fff" }}
        accessibilityRole="section"
      >
        <TouchableOpacity onPress={handlePerfil}>
          <Avatar
            source={profileImage}
            accessibilityRole="imagebutton"
            accessibilityLabel={`Imagem de perfil de ${userName}`}
          />
        </TouchableOpacity>
        <ProfileTextContainer>
          <UserName accessibilityRole="text">
            {userName || "Carregando..."}
          </UserName>
          <UserLevel accessibilityRole="text">Nível {userLevel}</UserLevel>
          <StarsContainer accessibilityRole="progressbar">
            {stars}
          </StarsContainer>
        </ProfileTextContainer>
      </ProfileContainer>

      <Container_Pagina_Principal accessibilityRole="main">
        <Titulos
          accessibilityRole="header"
          accessibilityLabel="Começa a competir"
        >
          Começa a competir
        </Titulos>
        <Sub_Titulos
          accessibilityRole="text"
          accessibilityLabel="Junta-te a uma equipa"
        >
          Junta-te a uma equipa
        </Sub_Titulos>

        {/* Barra de Pesquisa */}
        <SearchBarContainer>
          <SearchIcon />
          <SearchInput
            placeholder="Pesquisa equipas"
            placeholderTextColor="rgba(38, 58, 131, 0.5)"
            value={searchText}
            onChangeText={setSearchText}
            accessibilityLabel="Pesquisar equipas por nome"
            accessibilityRole="search"
          />
        </SearchBarContainer>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#263A83" />
          </View>
        ) : equipas.length > 0 ? (
          equipas.map((equipa) => (
            <Card_Equipa
              accessibilityRole="button"
              key={equipa.id}
              onPress={() => handleModalEquipa(equipa.id)}
              icon={equipa.imagem}
              teamName={equipa.nome}
              playerCount={`${equipa.currentParticipants}/${equipa.numparticipantes}`}
              accessibilityLabel={`${equipa.nome}, ${equipa.currentParticipants} de ${equipa.numparticipantes} participantes`}
            />
          ))
        ) : (
          <Text style={styles.noTeamsText}>Nenhuma equipa encontrada.</Text>
        )}

        {/* Controles de Paginação */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            {console.log("🔍 Renderizando paginação:", {
              currentPage,
              totalPages,
            })}

            {/* Página 1 */}
            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === 1
                  ? styles.paginationButtonActive
                  : styles.paginationButtonInactive,
              ]}
              onPress={() => {
                console.log("Navegando para página 1");
                setCurrentPage(1);
              }}
              accessibilityLabel="Página 1"
              accessibilityRole="button"
              accessibilityState={{ selected: currentPage === 1 }}
            >
              <Text
                style={
                  currentPage === 1
                    ? styles.paginationTextActive
                    : styles.paginationTextInactive
                }
              >
                1
              </Text>
            </TouchableOpacity>

            {/* Página 2 (visível para currentPage <= 3) */}
            {totalPages > 2 && currentPage <= 3 && (
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  currentPage === 2
                    ? styles.paginationButtonActive
                    : styles.paginationButtonInactive,
                ]}
                onPress={() => {
                  console.log("Navegando para página 2");
                  setCurrentPage(2);
                }}
                accessibilityLabel="Página 2"
                accessibilityRole="button"
                accessibilityState={{ selected: currentPage === 2 }}
              >
                <Text
                  style={
                    currentPage === 2
                      ? styles.paginationTextActive
                      : styles.paginationTextInactive
                  }
                >
                  2
                </Text>
              </TouchableOpacity>
            )}

            {/* Página 3 (visível para currentPage = 3 ou totalPages <= 4) */}
            {totalPages > 2 &&
              (currentPage === 3 || (totalPages <= 4 && currentPage === 4)) && (
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    currentPage === 3
                      ? styles.paginationButtonActive
                      : styles.paginationButtonInactive,
                  ]}
                  onPress={() => {
                    console.log("Navegando para página 3");
                    setCurrentPage(3);
                  }}
                  accessibilityLabel="Página 3"
                  accessibilityRole="button"
                  accessibilityState={{ selected: currentPage === 3 }}
                >
                  <Text
                    style={
                      currentPage === 3
                        ? styles.paginationTextActive
                        : styles.paginationTextInactive
                    }
                  >
                    3
                  </Text>
                </TouchableOpacity>
              )}

            {/* Página anterior à atual (para currentPage > 4) */}
            {totalPages > 4 && currentPage > 4 && (
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  styles.paginationButtonInactive,
                ]}
                onPress={() => {
                  const prevPage = currentPage - 1;
                  console.log("Navegando para página:", prevPage);
                  setCurrentPage(prevPage);
                }}
                accessibilityLabel={`Página ${currentPage - 1}`}
                accessibilityRole="button"
                accessibilityState={{ selected: false }}
              >
                <Text style={styles.paginationTextInactive}>
                  {currentPage - 1}
                </Text>
              </TouchableOpacity>
            )}

            {/* Elipse antes da página 3 ou anterior à atual (para currentPage >= 4) */}
            {totalPages > 3 && currentPage >= 4 && (
              <TouchableOpacity
                style={styles.ellipsisButton}
                onPress={() => {
                  const prevPage = currentPage - 2 > 1 ? currentPage - 2 : 2;
                  console.log("Navegando para página via elipse:", prevPage);
                  setCurrentPage(prevPage);
                }}
                accessibilityLabel={`Ir para página ${
                  currentPage - 2 > 1 ? currentPage - 2 : 2
                }`}
                accessibilityRole="button"
                accessibilityHint="Navega para a página anterior"
              >
                <Text style={styles.ellipsis}>...</Text>
              </TouchableOpacity>
            )}

            {/* Elipse antes da última página (para currentPage <= 2 e totalPages > 3) */}
            {totalPages > 3 && currentPage <= 2 && (
              <TouchableOpacity
                style={styles.ellipsisButton}
                onPress={() => {
                  console.log("Navegando para página 3 via elipse");
                  setCurrentPage(3);
                }}
                accessibilityLabel="Ir para página 3"
                accessibilityRole="button"
                accessibilityHint="Navega para a página 3"
              >
                <Text style={styles.ellipsis}>...</Text>
              </TouchableOpacity>
            )}

            {/* Última página (ou página 4 para totalPages <= 4) */}
            {totalPages > 2 && (
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  currentPage === (totalPages <= 4 ? 4 : totalPages)
                    ? styles.paginationButtonActive
                    : currentPage > 4 && currentPage < totalPages
                    ? styles.paginationButtonInactive
                    : currentPage === totalPages
                    ? styles.paginationButtonActive
                    : styles.paginationButtonInactive,
                ]}
                onPress={() => {
                  const lastPage = totalPages <= 4 ? 4 : totalPages;
                  console.log("Navegando para última página:", lastPage);
                  setCurrentPage(lastPage);
                }}
                accessibilityLabel={`Página ${
                  totalPages <= 4 ? 4 : totalPages
                }`}
                accessibilityRole="button"
                accessibilityState={{
                  selected:
                    currentPage === (totalPages <= 4 ? 4 : totalPages) ||
                    (currentPage === totalPages && totalPages > 4),
                }}
              >
                <Text
                  style={
                    currentPage === (totalPages <= 4 ? 4 : totalPages) ||
                    (currentPage === totalPages && totalPages > 4)
                      ? styles.paginationTextActive
                      : styles.paginationTextInactive
                  }
                >
                  {totalPages <= 4 ? 4 : totalPages}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Botoes_Pagina_principal
          accessibilityRole="button"
          style={{ marginTop: 15 }}
          onPress={Criar_Equipa}
        >
          <Texto_Botoes_Pagina_principal accessibilityRole="button">
            Criar Equipa
          </Texto_Botoes_Pagina_principal>
        </Botoes_Pagina_principal>

        {/* Modal de Criação de Equipa */}
        <Modal animationType="fade" transparent={true} visible={modalVisible}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <CaixaQuestionario>
              <Titulos
                accessibilityRole="header"
                accessibilityLabel="Criar Equipa"
              >
                Criar Equipa
              </Titulos>
              <Caixas_de_Texto_Criar_Equipa
                titulo="Dá um nome à tua equipa"
                placeholder="Exemplo: Os incríveis"
                value={NomeEquipa}
                onChangeText={setNomeEquipa}
                editable={true}
                error={nomeEquipaError}
                onError={setNomeEquipaError}
              />
              <Caixas_de_Texto_Criar_Equipa
                titulo="Adiciona uma descrição"
                placeholder="Exemplo: Vamos ganhar!"
                value={DescricaoEquipa}
                onChangeText={setDescricaoEquipa}
                editable={true}
                error={descricaoEquipaError}
                onError={setDescricaoEquipaError}
              />
              <View>
                <Titulos_Criar_Equipa
                  accessibilityRole="text"
                  accessibilityLabel="Define a quantidade de participantes"
                >
                  Define a quantidade de participantes
                </Titulos_Criar_Equipa>
                <View style={styles.participantsContainer}>
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        selectedValue === option && styles.optionButtonSelected,
                      ]}
                      onPress={() => setSelectedValue(option)}
                      accessibilityRole="button"
                      accessibilityLabel={`${option} participantes`}
                      accessibilityHint={
                        selectedValue === option
                          ? "Opção selecionada"
                          : "Toque para selecionar " + option + " participantes"
                      }
                      accessibilityState={{
                        selected: selectedValue === option,
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedValue === option && styles.optionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.visibilidadeContainer}>
                <Titulos_Criar_Equipa
                  accessibilityRole="text"
                  accessibilityLabel="Define a visibilidade da tua equipa"
                >
                  Define a visibilidade da tua equipa{" "}
                  <Text style={{ color: "#B30000" }}>*</Text>
                </Titulos_Criar_Equipa>
                <BotaoNavegacaoContainer>
                  <Definir_visibilidade_btn
                    style={{
                      backgroundColor:
                        activeButton === "public" ? "#E3FC87" : "transparent",
                    }}
                    onPress={() => handleButtonClick("public")}
                    accessibilityLabel="Tornar equipa pública"
                    accessibilityRole="button"
                  >
                    <Texto_Botoes_Definir_Visibilidade accessibilityRole="button">
                      Pública
                    </Texto_Botoes_Definir_Visibilidade>
                  </Definir_visibilidade_btn>
                  <Definir_visibilidade_btn
                    style={{
                      backgroundColor:
                        activeButton === "private" ? "#E3FC87" : "transparent",
                    }}
                    onPress={() => handleButtonClick("private")}
                    accessibilityLabel="Tornar equipa privada"
                    accessibilityRole="button"
                  >
                    <Texto_Botoes_Definir_Visibilidade accessibilityRole="button">
                      Privada
                    </Texto_Botoes_Definir_Visibilidade>
                  </Definir_visibilidade_btn>
                </BotaoNavegacaoContainer>
                {visibilidadeError ? (
                  <Text
                    style={styles.errorText}
                    accessibilityLiveRegion="assertive"
                    accessibilityRole="alert"
                  >
                    {visibilidadeError}
                  </Text>
                ) : null}
              </View>

              {/* Campo de Convite */}
              {activeButton === "private" && inviteLink && (
                <View style={styles.inviteContainer}>
                  <Titulos_Criar_Equipa
                    accessibilityRole="text"
                    accessibilityLabel="Convida os teus amigos"
                  >
                    Convida os teus amigos
                  </Titulos_Criar_Equipa>
                  <View style={styles.inviteFieldContainer}>
                    <TextInput
                      value={inviteLink}
                      editable={false}
                      style={styles.inviteField}
                      accessibilityRole="textbox"
                      accessibilityLabel="Link de convite"
                      accessibilityValue={{ text: inviteLink }}
                    />
                    <TouchableOpacity
                      onPress={() => copyToClipboard(inviteLink)}
                      style={styles.copyButton}
                      accessibilityRole="button"
                      accessibilityLabel="Copiar link de convite"
                    >
                      <Svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#263A83"
                      >
                        <Path
                          d="M18 6H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 9.5c.83 0 1.5-.67 1.5-1.5S18.83 8 18 8s-.67 1.5-1.5 1.5S15 11.5 15 13z"
                          fill="#263A83"
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <BotaoNavegacaoContainer>
                <Botoes_Pagina_principal
                  style={{ backgroundColor: "transparent" }}
                  onPress={() => setModalVisible(false)}
                  accessibilityLabel="Voltar"
                  accessibilityRole="button"
                >
                  <Texto_Botoes_Pagina_principal_Voltar>
                    Voltar
                  </Texto_Botoes_Pagina_principal_Voltar>
                </Botoes_Pagina_principal>
                <Botoes_Pagina_principal
                  style={{ backgroundColor: "#263A83" }}
                  onPress={handleNext}
                  accessibilityLabel="Seguinte"
                  accessibilityRole="button"
                >
                  <Texto_Botoes_Pagina_principal>
                    Seguinte
                  </Texto_Botoes_Pagina_principal>
                </Botoes_Pagina_principal>
              </BotaoNavegacaoContainer>
            </CaixaQuestionario>
          </View>
        </Modal>

        {/* Modal de Entrada na Equipa */}
        {modalEquipa && (
          <Modal
            visible={modalEquipa}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setModalEquipa(false)}
          >
            <View accessibility={true} style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text
                  style={styles.modalTitle}
                  accessibilityRole="header"
                  accessibilityLabel="Entrar na Equipa"
                >
                  Entrar na Equipa
                </Text>
                <Text
                  style={styles.modalDescription}
                  accessibilityRole="text"
                  accessibilityLabel="Tens a certeza de que queres juntar-te à equipa?"
                >
                  Tens a certeza de que queres juntar-te à equipa?
                </Text>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalEquipa(false)}
                  >
                    <Text
                      style={styles.cancelButtonText}
                      accessibilityLabel="Cancelar"
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleNext2}
                  >
                    <Text
                      style={styles.confirmButtonText}
                      accessibilityRole="button"
                      accessibilityLabel="Entrar"
                    >
                      Entrar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </Container_Pagina_Principal>
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "85%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: 10,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 12,
    color: "#6B6B6B",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  confirmButton: {
    backgroundColor: "#263A83",
  },
  cancelButtonText: {
    color: "#6B6B6B",
    fontWeight: "bold",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "#B30000",
    fontSize: 12,
    marginTop: 5,
  },
  participantsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  optionButton: {
    width: 60,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#263A83",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 5,
  },
  optionButtonSelected: {
    backgroundColor: "#263A83",
    borderColor: "#263A83",
  },
  optionText: {
    fontSize: 16,
    color: "#263A83",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  inviteContainer: {
    marginTop: 10,
  },
  inviteFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#263A83",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inviteField: {
    flex: 1,
    fontSize: 14,
    color: "#263A83",
  },
  copyButton: {
    marginLeft: 5,
  },
  visibilidadeContainer: {
    marginBottom: 10,
  },
  noTeamsText: {
    fontSize: 16,
    color: "#263A83",
    textAlign: "center",
    marginTop: 20,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    minHeight: 40, // Garante espaço suficiente
  },
  paginationButton: {
    width: 60, // Aumentado para melhor visibilidade
    height: 35,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    overflow: "visible", // Evita corte de texto
  },
  paginationButtonActive: {
    backgroundColor: "#E3FC87",
    borderWidth: 1,
    borderColor: "#263A83",
  },
  paginationButtonInactive: {
    backgroundColor: "#263A83",
  },
  paginationTextActive: {
    color: "#263A83",
    fontWeight: "bold",
    fontSize: 16, // Aumentado para legibilidade
    textAlign: "center",
  },
  paginationTextInactive: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  ellipsis: {
    fontSize: 18, // Aumentado para visibilidade
    color: "#263A83",
    marginHorizontal: 8,
    alignSelf: "center",
  },
  ellipsisButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 30, // Garante espaço para elipse
  },
});
