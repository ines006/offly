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

// Componente para os campos de texto
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
        autoCapitalize="none"
        returnKeyType="done"
        onBlur={() => {
          if (!value.trim()) {
            if (titulo === "Dá um nome à tua equipa") {
              onError("Tens de definir um nome para a tua equipa");
            } else if (titulo === "Adiciona uma descrição") {
              onError("A tua equipa deve ter uma descrição que a caraterize");
            } else if (titulo === "Insere o link de convite") {
              onError("Tens de inserir um link de convite válido");
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
  const [modalJoinByInvite, setModalJoinByInvite] = useState(false);
  const [selectedEquipaId, setSelectedEquipaId] = useState(null);
  const [inviteToken, setInviteToken] = useState("");
  const [inviteTokenError, setInviteTokenError] = useState("");

  const [NomeEquipa, setNomeEquipa] = useState("");
  const [DescricaoEquipa, setDescricaoEquipa] = useState("");
  const [activeButton, setActiveButton] = useState(null);
  const [selectedValue, setSelectedValue] = useState("3");
  const [nomeEquipaError, setNomeEquipaError] = useState("");
  const [descricaoEquipaError, setDescricaoEquipaError] = useState("");
  const [visibilidadeError, setVisibilidadeError] = useState("");
  const [inviteLink, setInviteLink] = useState(null);
  const [teamId, setTeamId] = useState(null); // Estado para teamId

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const options = ["3", "4", "5"];
  const router = useRouter();

  const imageTeamUrls = [
    "https://celina05.sirv.com/equipasFinal/Group%20300%20(1).png",
    "https://celina05.sirv.com/equipasFinal/Group%2013959.png",
    "https://celina05.sirv.com/equipasFinal/Group%2013960.png",
    "https://celina05.sirv.com/equipasFinal/Group%2013961.png",
    "https://celina05.sirv.com/equipasFinal/Group%2013962.png",
    "https://celina05.sirv.com/equipasFinal/Group%2013963.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.51.27-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.50.14-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.52.12-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.52.12-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.52.51-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.53.23-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.53.56-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.54.27-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.54.56-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.55.24-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.56.03-removebg-preview.png",
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

  const criarEquipa = async () => {
    try {
      console.log("🔄 Criando equipa...");
      const equipaData = {
        name: NomeEquipa,
        description: DescricaoEquipa,
        capacity: parseInt(selectedValue),
        visibility: activeButton === "public" ? 1 : 0,
        image: getRandomImage(imageTeamUrls),
        competitions_id: 1,
        team_passbooks_id: 1,
        team_admin: user.id,
      };

      console.log("📤 Dados da equipa:", equipaData);

      // Criar a equipa
      const response = await axios.post(`${baseurl}/teams`, equipaData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      const newTeamId = response.data.id;
      console.log("✅ Equipa criada com ID:", newTeamId);
      setTeamId(newTeamId);
      console.log("🆔 teamId definido no estado:", newTeamId);

      // Criar convite para equipa privada
      let newInviteLink = null;
      if (activeButton === "private") {
        try {
          const inviteUrl = `${baseurl}/teams/${newTeamId}/invites`;
          console.log(`🌐 Chamando convite: ${inviteUrl}`);
          const inviteResponse = await axios.post(
            inviteUrl,
            {},
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          newInviteLink = inviteResponse.data.inviteLink;
          console.log("🔗 Invite link criado:", newInviteLink);
          setInviteLink(newInviteLink);
          await Clipboard.setStringAsync(newInviteLink);
          // Alert.alert(
          //   "Sucesso",
          //   "Equipa privada criada! O link de convite foi copiado para a área de transferência."
          // );
        } catch (inviteError) {

          let inviteErrorMessage = "Não foi possível gerar o link de convite.";
          if (inviteError.response) {
            inviteErrorMessage =
              inviteError.response.data.message ||
              inviteError.response.data.error ||
              inviteErrorMessage;
          }
          Alert.alert(
            "Aviso",
            `Equipa criada com sucesso, mas houve um erro ao gerar o convite: ${inviteErrorMessage}`
          );
        }
      } else {
        // Alert.alert("Sucesso", "Equipa pública criada com sucesso!");
        setModalVisible(false);
        console.log(
          "🔄 Redirecionando para /EquipaCriada com teamId:",
          newTeamId
        );
        try {
          router.push({
            pathname: "/EquipaCriada",
            params: { teamId: newTeamId },
          });
        } catch (error) {
  
          Alert.alert(
            "Erro",
            "Não foi possível redirecionar para a página da equipa."
          );
        }
      }
    } catch (error) {

      let errorMessage = "Não foi possível criar a equipa.";
      if (error.response) {
        errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          errorMessage;
        console.log("🔍 Resposta do erro:", error.response.data);
      }
      Alert.alert("Erro", errorMessage);
    }
  };

  // Entrar numa equipa pública
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
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      console.log("✅ Sucesso:", response.data);
      // Alert.alert("Sucesso", "Você entrou na equipa com sucesso!");

      if (typeof setModalEquipa === "function") {
        setModalEquipa(false);
      } else {
        console.warn(
          "⚠️ setModalEquipa não é uma função ou não está definido."
        );
      }

      router.push({
        pathname: "/EquipaCriada",
        params: { teamId: selectedEquipaId },
      });
    } catch (error) {

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

  // Entrar numa equipa privada por convite
  const handleJoinByInvite = async () => {
    if (!user?.id) {
      console.warn("⚠️ Utilizador não autenticado ou ID não disponível.");
      Alert.alert(
        "Erro",
        "Você precisa estar autenticado para entrar numa equipa."
      );
      return;
    }
    if (!accessToken) {
      console.warn("⚠️ Token de acesso não disponível.");
      Alert.alert("Erro", "Token de autenticação não encontrado.");
      return;
    }
    if (!inviteToken.trim()) {
      setInviteTokenError("Tens de inserir um link de convite válido");
      return;
    }

    let token = inviteToken;
    let urlMatch = null;
    if (inviteToken.includes("token=")) {
      urlMatch = inviteToken.match(/token=([^&]+)/);
      if (urlMatch && urlMatch[1]) {
        token = urlMatch[1];
      }
    }
    console.log("🔍 inviteToken original:", inviteToken);
    console.log("🔍 urlMatch:", urlMatch);
    console.log("🔍 Token extraído:", token);

    try {
      console.log("🔄 Entrando na equipa privada com token:", token);
      const response = await axios.post(
        `${baseurl}/teams/join-by-invite`,
        { token },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      console.log("✅ Sucesso:", response.data);
      const teamId = response.data.teamId || response.data.id;
      // Alert.alert("Sucesso", "Você entrou na equipa privada com sucesso!");

      setModalJoinByInvite(false);
      router.push({
        pathname: "/EquipaCriada",
        params: { teamId },
      });
    } catch (error) {

      let errorMessage = "Não foi possível entrar na equipa privada.";
      if (error.response) {
        console.log("🔍 Resposta do backend:", error.response.data);
        const { status, data } = error.response;
        if (status === 400) {
          errorMessage = data.error || "Convite inválido ou equipa cheia.";
        } else if (status === 403) {
          errorMessage =
            data.error || "Acesso negado: token inválido ou sem permissão.";
        } else if (status === 404) {
          errorMessage = data.error || "Convite ou equipa não encontrados.";
        } else if (status === 500) {
          errorMessage =
            data.details ||
            data.error ||
            "Erro interno no servidor. Tente novamente mais tarde.";
        }
      } else if (error.request) {
        console.log("🔍 Sem resposta do servidor:", error.request);
        errorMessage = "Sem resposta do servidor. Verifique sua conexão.";
      } else {
        console.log("🔍 Erro na configuração da requisição:", error.message);
        errorMessage = "Erro ao configurar a requisição.";
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

  const handleNext3 = () => {
    handleJoinByInvite();
  };

  const handleButtonClick = (button) => {
    setActiveButton(button);
    if (button) {
      setVisibilidadeError("");
    }
    setInviteLink(null); // Resetar o link de convite
  };

  const handlePerfil = () => {
    router.push("./perfil");
  };

  const Criar_Equipa = () => {
    setModalVisible(true);
  };

  const Entrar_Por_Convite = () => {
    setInviteToken("");
    setInviteTokenError("");
    setModalJoinByInvite(true);
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

  function copyToClipboard(text) {
    Clipboard.setStringAsync(text);
    // Alert.alert("Sucesso", "Link copiado para a área de transferência!");
  }

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

        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            {/* Botão Anterior */}
            {currentPage > 1 && (
              <TouchableOpacity
                style={styles.paginationNavButton}
                onPress={() => setCurrentPage(currentPage - 1)}
                accessibilityLabel="Página anterior"
                accessibilityRole="button"
              >
                <Text style={styles.paginationNavText}>‹</Text>
              </TouchableOpacity>
            )}

            {/* Primeira página */}
            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === 1
                  ? styles.paginationButtonActive
                  : styles.paginationButtonInactive,
              ]}
              onPress={() => setCurrentPage(1)}
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

            {/* Reticências à esquerda */}
            {currentPage > 3 && totalPages > 4 && (
              <TouchableOpacity
                style={styles.ellipsisButton}
                onPress={() => setCurrentPage(Math.max(1, currentPage - 3))}
                accessibilityLabel="Páginas anteriores"
                accessibilityRole="button"
              >
                <Text style={styles.ellipsis}>...</Text>
              </TouchableOpacity>
            )}

            {/* Páginas do meio */}
            {(() => {
              const pages = [];
              let startPage, endPage;

              if (totalPages <= 4) {
                // Se temos 4 ou menos páginas, mostra todas
                startPage = 2;
                endPage = totalPages - 1;
              } else {
                // Lógica para mostrar páginas ao redor da atual
                if (currentPage <= 3) {
                  startPage = 2;
                  endPage = 3;
                } else if (currentPage >= totalPages - 2) {
                  startPage = totalPages - 2;
                  endPage = totalPages - 1;
                } else {
                  startPage = currentPage - 1;
                  endPage = currentPage + 1;
                }
              }

              for (let i = startPage; i <= endPage && i < totalPages; i++) {
                pages.push(
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.paginationButton,
                      currentPage === i
                        ? styles.paginationButtonActive
                        : styles.paginationButtonInactive,
                    ]}
                    onPress={() => setCurrentPage(i)}
                    accessibilityLabel={`Página ${i}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: currentPage === i }}
                  >
                    <Text
                      style={
                        currentPage === i
                          ? styles.paginationTextActive
                          : styles.paginationTextInactive
                      }
                    >
                      {i}
                    </Text>
                  </TouchableOpacity>
                );
              }

              return pages;
            })()}

            {/* Reticências à direita */}
            {currentPage < totalPages - 2 && totalPages > 4 && (
              <TouchableOpacity
                style={styles.ellipsisButton}
                onPress={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 3))
                }
                accessibilityLabel="Próximas páginas"
                accessibilityRole="button"
              >
                <Text style={styles.ellipsis}>...</Text>
              </TouchableOpacity>
            )}

            {/* Última página */}
            {totalPages > 1 && (
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  currentPage === totalPages
                    ? styles.paginationButtonActive
                    : styles.paginationButtonInactive,
                ]}
                onPress={() => setCurrentPage(totalPages)}
                accessibilityLabel={`Página ${totalPages}`}
                accessibilityRole="button"
                accessibilityState={{ selected: currentPage === totalPages }}
              >
                <Text
                  style={
                    currentPage === totalPages
                      ? styles.paginationTextActive
                      : styles.paginationTextInactive
                  }
                >
                  {totalPages}
                </Text>
              </TouchableOpacity>
            )}

            {/* Botão Próximo */}
            {currentPage < totalPages && (
              <TouchableOpacity
                style={styles.paginationNavButton}
                onPress={() => setCurrentPage(currentPage + 1)}
                accessibilityLabel="Próxima página"
                accessibilityRole="button"
              >
                <Text style={styles.paginationNavText}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Botões Criar Equipa e Entrar por Convite */}
        <View style={styles.buttonsContainer}>
          <Botoes_Pagina_principal
            accessibilityRole="button"
            style={{ marginRight: 10, flex: 1 }}
            onPress={Criar_Equipa}
          >
            <Texto_Botoes_Pagina_principal accessibilityRole="button">
              Criar Equipa
            </Texto_Botoes_Pagina_principal>
          </Botoes_Pagina_principal>
          <Botoes_Pagina_principal
            accessibilityRole="button"
            onPress={Entrar_Por_Convite}
          >
            <Texto_Botoes_Pagina_principal accessibilityRole="button">
              Convite
            </Texto_Botoes_Pagina_principal>
          </Botoes_Pagina_principal>
        </View>

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
                editable={!inviteLink}
                error={nomeEquipaError}
                onError={setNomeEquipaError}
              />
              <Caixas_de_Texto_Criar_Equipa
                titulo="Adiciona uma descrição"
                placeholder="Exemplo: Vamos ganhar!"
                value={DescricaoEquipa}
                onChangeText={setDescricaoEquipa}
                editable={!inviteLink}
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
                      disabled={!!inviteLink}
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
                    disabled={!!inviteLink}
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
                    disabled={!!inviteLink}
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
                          d="M16 1H4a2 2 0 00-2 2v14h2V3h12V1zm3 4H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h11v14z"
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
                  onPress={() => {
                    setModalVisible(false);
                    setInviteLink(null);
                    setTeamId(null);
                    setNomeEquipa("");
                    setDescricaoEquipa("");
                    setActiveButton(null);
                    setSelectedValue("3");
                  }}
                  accessibilityLabel="Cancelar"
                  accessibilityRole="button"
                >
                  <Texto_Botoes_Pagina_principal_Voltar>
                    {inviteLink ? "Fechar" : "Cancelar"}
                  </Texto_Botoes_Pagina_principal_Voltar>
                </Botoes_Pagina_principal>
                <Botoes_Pagina_principal
                  style={{ backgroundColor: "#263A83" }}
                  onPress={() => {
                    if (inviteLink && teamId) {
                      console.log(
                        "🔄 Redirecionando para /EquipaCriada com teamId:",
                        teamId
                      );
                      try {
                        setModalVisible(false);
                        router.push({
                          pathname: "/EquipaCriada",
                          params: { teamId },
                        });
                      } catch (error) {
      
                        Alert.alert(
                          "Erro",
                          "Não foi possível redirecionar para a página da equipa."
                        );
                      }
                    } else {
                      console.log("⚠️ teamId ou inviteLink não definido:", {
                        teamId,
                        inviteLink,
                      });
                      handleNext();
                    }
                  }}
                  accessibilityLabel={inviteLink ? "Concluir" : "Seguinte"}
                  accessibilityRole="button"
                >
                  <Texto_Botoes_Pagina_principal>
                    {inviteLink ? "Concluir" : "Seguinte"}
                  </Texto_Botoes_Pagina_principal>
                </Botoes_Pagina_principal>
              </BotaoNavegacaoContainer>
            </CaixaQuestionario>
          </View>
        </Modal>

        {/* Modal de Entrada na Equipa Pública */}
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

        {/* Modal de Entrada por Convite */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalJoinByInvite}
          onRequestClose={() => setModalJoinByInvite(false)}
        >
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
                accessibilityLabel="Entrar por Convite"
              >
                Entrar por Convite
              </Titulos>
              <Caixas_de_Texto_Criar_Equipa
                titulo="Insere o link de convite"
                placeholder="Exemplo: http://offly.com/join?token"
                value={inviteToken}
                onChangeText={setInviteToken}
                editable={true}
                error={inviteTokenError}
                onError={setInviteTokenError}
              />
              <BotaoNavegacaoContainer>
                <Botoes_Pagina_principal
                  style={{ backgroundColor: "transparent" }}
                  onPress={() => setModalJoinByInvite(false)}
                  accessibilityLabel="Cancelar"
                  accessibilityRole="button"
                >
                  <Texto_Botoes_Pagina_principal_Voltar>
                    Cancelar
                  </Texto_Botoes_Pagina_principal_Voltar>
                </Botoes_Pagina_principal>
                <Botoes_Pagina_principal
                  style={{ backgroundColor: "#263A83" }}
                  onPress={handleNext3}
                  accessibilityLabel="Entrar"
                  accessibilityRole="button"
                >
                  <Texto_Botoes_Pagina_principal>
                    Entrar
                  </Texto_Botoes_Pagina_principal>
                </Botoes_Pagina_principal>
              </BotaoNavegacaoContainer>
            </CaixaQuestionario>
          </View>
        </Modal>
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
    minHeight: 40,
  },
  paginationButton: {
    width: 60,
    height: 35,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    overflow: "visible",
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
    fontSize: 16,
    textAlign: "center",
  },
  paginationTextInactive: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  ellipsis: {
    fontSize: 18,
    color: "#263A83",
    marginHorizontal: 8,
    alignSelf: "center",
  },
  ellipsisButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 30,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  paginationNavButton: {
    width: 35,
    height: 35,
    borderRadius: 16,
    backgroundColor: "#263A83",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  paginationNavText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  paginationButton: {
    width: 50,
    height: 35,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    overflow: "visible",
  },
});
