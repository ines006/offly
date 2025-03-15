import { useFonts } from "expo-font";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Text,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import ModalDropdown from "react-native-modal-dropdown";
import { Svg, Path } from "react-native-svg";
import { useRouter } from "expo-router";
import Card_Equipa from "./components/Equipas-copy";
// Firebase Imports
import {
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  collection,
} from "firebase/firestore";
import { auth, db } from "./firebase/firebaseApi";
import {
  Container_Pagina_Pricipal,
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
    editable,
    error,
    onError,
    placeholderTextColor,
  } = props;

  return (
    <View>
      <Titulos_Criar_Equipa>
        {titulo} <Text style={{ color: "#B30000" }}>*</Text>
      </Titulos_Criar_Equipa>
      <Caixa_de_texto
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        editable={editable}
        accessibilityLabel={`${titulo} (obrigatório)`}
        accessibilityHint={`Insira ${titulo.toLowerCase()}`}
        placeholderTextColor={placeholderTextColor || "rgba(38, 58, 131, 0.5)"}
        onBlur={() => {
          if (!value.trim()) {
            if (titulo === "Dá um nome à tua equipa") {
              onError("Tens de definir um nome para a tua equipa");
            } else if (titulo === "Adiciona uma descrição") {
              onError("A tua equipa deve ter uma descrição que a caraterize");
            }
          } else {
            onError(""); // Limpa o erro se preenchido
          }
        }}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function PaginaPrincipal() {
  // Fontes personalizadas
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  // Estado para equipas
  const [equipas, setEquipas] = useState([]);
  const [filteredEquipas, setFilteredEquipas] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Estados para o modal e inputs
  const [modalVisible, setModalVisible] = useState(false);
  const [NomeEquipa, setNomeEquipa] = useState("");
  const [DescricaoEquipa, setDescricaoEquipa] = useState("");
  const [Invcode, setInvcode] = useState("https://offly/join-team?invitecode");
  const [activeButton, setActiveButton] = useState(null);
  const [selectedValue, setSelectedValue] = useState("3");
  const [nomeEquipaError, setNomeEquipaError] = useState("");
  const [descricaoEquipaError, setDescricaoEquipaError] = useState("");
  const [visibilidadeError, setVisibilidadeError] = useState("");

  const options = ["3", "4", "5"];
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  // Para entrar na equipa
  const [selectedEquipaId, setSelectedEquipaId] = useState(null);
  const [modalEquipa, setModalEquipa] = useState(false);

  // Array de URLs das imagens p/ equipas
  const imageTeamUrls = [
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.50.14-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.51.27-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.52.12-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.52.51-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.53.23-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.53.56-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.54.27-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.54.56-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.55.24-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.56.03-removebg-preview.png",
  ];

  // Array de URLs das imagens p/ users
  const imageUserUrls = [
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
  const getRandomImage = (tipo) => {
    const randomIndex = Math.floor(Math.random() * tipo.length);
    return tipo[randomIndex];
  };

  // Verificação de utilizador logado
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
      console.log("utilizador logado na pag principal", currentUser);
    } else {
      Alert.alert("Erro", "Nenhum utilizador logado!");
    }
  }, []);

  // Função para obter os dados do utilizador
  useEffect(() => {
    const userData = async () => {
      try {
        if (!userId) return;
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const { fullName, team, image } = docSnap.data();
          setUserName(fullName);

          if (image) {
            setProfileImage({ uri: image });
          } else {
            const newProfileImage = getRandomImage(imageUserUrls);
            setProfileImage({ uri: newProfileImage });
            await updateDoc(userDocRef, { image: newProfileImage });
          }
        } else {
          console.log("Documento do utilizador não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao verificar o nome", error);
      }
    };

    userData();
  }, [userId]);

  // Função para buscar equipas da DB
  const fetchEquipas = async () => {
    try {
      const equipasCollectionRef = collection(db, "equipas");
      const querySnapshot = await getDocs(equipasCollectionRef);

      const equipaData = [];

      for (const equipaDoc of querySnapshot.docs) {
        const equipa = { id: equipaDoc.id, ...equipaDoc.data() };

        const membrosCollectionRef = collection(
          db,
          `equipas/${equipaDoc.id}/membros`
        );
        const membrosSnapshot = await getDocs(membrosCollectionRef);

        let currentParticipants = 0;
        membrosSnapshot.forEach((membroDoc) => {
          if (membroDoc.id === "participantes") {
            currentParticipants = Object.keys(membroDoc.data()).length;
          }
        });

        if (Math.abs(currentParticipants - equipa.numparticipantes) === 1) {
          equipaData.push({ ...equipa, currentParticipants });
        }
      }

      setEquipas(equipaData);
      setFilteredEquipas(equipaData);
    } catch (error) {
      console.error("Erro ao buscar equipas:", error);
    }
  };

  // Carregar equipas ao montar o componente
  useEffect(() => {
    fetchEquipas();
  }, []);

  // Atualizar equipas filtradas com base no texto da pesquisa
  useEffect(() => {
    const filtered = equipas.filter(
      (equipa) =>
        equipa.nome &&
        equipa.nome.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredEquipas(filtered);
  }, [searchText, equipas]);

  const criarEquipa = async () => {
    try {
      console.log("Iniciando criação da equipa...");
      const user = auth.currentUser;
      if (!user) {
        throw new Error(
          "Nenhum utilizador logado! Não é possível criar equipa."
        );
      }
      console.log("Utilizador logado:", user.uid);

      const equipaData = {
        nome: NomeEquipa,
        descricao: DescricaoEquipa,
        numparticipantes: parseInt(selectedValue),
        visibilidade: activeButton === "public" ? "publica" : "privada",
        adquiridos: 0,
        pontos: 1000,
        imagem: getRandomImage(imageTeamUrls),
      };

      const equipaDocRef = doc(db, "equipas", NomeEquipa);
      await setDoc(equipaDocRef, equipaData);
      console.log("Equipa criada com sucesso com ID:", NomeEquipa);

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new Error("Utilizador não encontrado na coleção 'users'.");
      }
      const userFullName = userDocSnap.data().fullName;
      console.log("Nome do utilizador logado:", userFullName);

      const membrosDocRef = doc(
        collection(equipaDocRef, "membros"),
        "participantes"
      );
      const participantes = { participante1: userFullName };

      const nomesAleatorios = [
        "Ana",
        "João",
        "Maria",
        "Pedro",
        "Rita",
        "Carlos",
        "Luísa",
        "Tiago",
        "Sofia",
        "Miguel",
      ];

      for (let i = 2; i <= equipaData.numparticipantes; i++) {
        const nomeAleatorio =
          nomesAleatorios[Math.floor(Math.random() * nomesAleatorios.length)];
        participantes[`participante${i}`] = nomeAleatorio;
      }

      await setDoc(membrosDocRef, participantes);
      console.log(
        "Coleção 'membros' e documento 'participantes' criados com sucesso!"
      );

      await updateDoc(userDocRef, { team: NomeEquipa });
      console.log("Campo 'team' do utilizador atualizado com sucesso!");

      setModalVisible(false);
      console.log("Processo concluído sem erros.");
    } catch (error) {
      console.error("Erro ao criar a equipa:", error.message);
    }
  };

  // Função para entrar numa equipa
  const handleEntrarnaEquipa = async () => {
    if (!userId || !selectedEquipaId) return;

    try {
      const equipaRef = doc(db, "equipas", selectedEquipaId);
      const equipaDoc = await getDoc(equipaRef);
      const equipaData = equipaDoc.data();

      const numParticipantes = equipaData.numparticipantes;
      const membrosRef = collection(equipaRef, "membros");
      const membrosDoc = await getDoc(doc(membrosRef, "participantes"));

      const participantes = membrosDoc.data() || {};

      let newParticipantKey = null;
      if (Object.keys(participantes).length < numParticipantes) {
        for (let i = 1; i <= numParticipantes; i++) {
          if (!participantes[`participante${i}`]) {
            newParticipantKey = `participante${i}`;
            break;
          }
        }
      }

      if (!newParticipantKey) {
        Alert.alert(
          "Erro",
          "Não há espaço disponível para entrar nesta equipa."
        );
        return;
      }

      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      const userName = userData.fullName;

      if (userData.team) {
        await updateDoc(userDocRef, {
          team: selectedEquipaId,
        });
      } else {
        await setDoc(userDocRef, {
          team: selectedEquipaId,
        });
      }

      await updateDoc(doc(membrosRef, "participantes"), {
        [newParticipantKey]: userName,
      });

      Alert.alert("Sucesso", `Você entrou na equipa ${equipaData.nome}!`);
    } catch (error) {
      console.error("Erro ao entrar na equipa:", error);
      Alert.alert("Erro", "Não foi possível entrar na equipa.");
    }
  };

  // Validação do formulário
  const validateForm = () => {
    let isValid = true;

    if (!NomeEquipa.trim()) {
      setNomeEquipaError("Tens de definir um nome para a tua equipa");
      isValid = false;
    } else {
      setNomeEquipaError("");
    }

    if (!DescricaoEquipa.trim()) {
      setDescricaoEquipaError(
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
      isValid = false;
    } else {
      setVisibilidadeError("");
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateForm()) {
      criarEquipa();
      setModalVisible(false);
      router.push({
        pathname: "./EquipaCriada",
        params: { teamId: NomeEquipa },
      });
    }
  };

  const handleNext2 = () => {
    handleEntrarnaEquipa();
    setModalEquipa(false);
    router.push({
      pathname: "./EquipaCriada",
      params: { teamId: selectedEquipaId },
    });
  };

  const handleButtonClick = (button) => {
    setActiveButton(button);
    if (button) {
      setVisibilidadeError(""); // Limpa o erro ao selecionar uma opção
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
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="#263A83">
      <Path
        d="M10.5 2a8.5 8.5 0 1 0 5.53 15.03l3.7 3.7a1.5 1.5 0 1 0 2.12-2.12l-3.7-3.7A8.5 8.5 0 0 0 10.5 2zm0 3a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z"
        fill="#1a237e"
      />
    </Svg>
  );

  if (!fontsLoaded) {
    return <Text>A carregar...</Text>;
  }

  return (
    <>
      <ProfileContainer
        style={{ backgroundColor: "#fff" }}
        accessibilityRole="section"
      >
        <TouchableOpacity onPress={handlePerfil}>
          <Avatar source={profileImage} accessibilityRole="imagebutton" />
        </TouchableOpacity>
        <ProfileTextContainer>
          <UserName accessibilityRole="text">{userName}</UserName>
          <UserLevel accessibilityRole="text">Nível 1</UserLevel>
          <StarsContainer accessibilityRole="progressbar">
            <Svg
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
      <Container_Pagina_Pricipal accessibilityRole="main">
        <Titulos accessibilityRole="header">Começa a competir</Titulos>
        <Sub_Titulos accessibilityRole="text">
          Junta-te a uma equipa
        </Sub_Titulos>

        <SearchBarContainer>
          <SearchIcon />
          <SearchInput
            accessibilityRole="search"
            placeholder="Pesquisa equipas"
            placeholderTextColor="rgba(38, 58, 131, 0.5)"
            value={searchText}
            onChangeText={setSearchText}
            accessibilityLabel="Pesquisa Equipas"
          />
        </SearchBarContainer>

        {filteredEquipas.length > 0 ? (
          filteredEquipas
            .slice(0, 4)
            .map((equipa) => (
              <Card_Equipa
                accessibilityRole="button"
                key={equipa.id}
                onPress={() => handleModalEquipa(equipa.id)}
                icon={equipa.imagem}
                teamName={equipa.nome}
                playerCount={`${equipa.currentParticipants}/${equipa.numparticipantes}`}
              />
            ))
        ) : (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#263A83" />
          </View>
        )}

        <Botoes_Pagina_principal
          style={{ marginTop: 45 }}
          onPress={Criar_Equipa}
        >
          <Texto_Botoes_Pagina_principal accessibilityRole="button">
            Criar equipa
          </Texto_Botoes_Pagina_principal>
        </Botoes_Pagina_principal>

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
              <Titulos accessibilityRole="header">Criar Equipa</Titulos>

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
                accessibilityRole="form"
                titulo="Adiciona uma descrição"
                placeholder="Exemplo: Vamos ganhar!"
                value={DescricaoEquipa}
                onChangeText={setDescricaoEquipa}
                editable={true}
                error={descricaoEquipaError}
                onError={setDescricaoEquipaError}
              />

              <View>
                <Titulos_Criar_Equipa accessibilityRole="text">
                  Define a quantidade de participantes
                </Titulos_Criar_Equipa>
                <View style={styles.dropdownWrapper}>
                  <ModalDropdown
                    options={options}
                    defaultValue={selectedValue}
                    onSelect={(index, value) => setSelectedValue(value)}
                    textStyle={styles.dropdownText}
                    dropdownStyle={styles.dropdownMenu}
                    style={styles.dropdownButton}
                    renderButtonText={(value) => value} // Garante que o valor selecionado seja exibido
                    accessibilityLabel="Quantidade de participantes"
                    accessibilityHint="Selecione o número de participantes"
                  />
                </View>
              </View>

              <View>
                <Titulos_Criar_Equipa accessibilityRole="text">
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
                  >
                    <Texto_Botoes_Definir_Visibilidade accessibilityRole="button">
                      Privada
                    </Texto_Botoes_Definir_Visibilidade>
                  </Definir_visibilidade_btn>
                </BotaoNavegacaoContainer>
                {visibilidadeError ? (
                  <Text style={styles.errorText}>{visibilidadeError}</Text>
                ) : null}
              </View>

              <BotaoNavegacaoContainer>
                <Botoes_Pagina_principal
                  style={{ backgroundColor: "transparent" }}
                  onPress={() => setModalVisible(false)}
                  accessibilityLabel="Voltar"
                >
                  <Texto_Botoes_Pagina_principal_Voltar>
                    Voltar
                  </Texto_Botoes_Pagina_principal_Voltar>
                </Botoes_Pagina_principal>

                <Botoes_Pagina_principal
                  style={{ backgroundColor: "#263A83" }}
                  onPress={handleNext}
                  accessibilityLabel="Seguinte"
                >
                  <Texto_Botoes_Pagina_principal>
                    Seguinte
                  </Texto_Botoes_Pagina_principal>
                </Botoes_Pagina_principal>
              </BotaoNavegacaoContainer>
            </CaixaQuestionario>
          </View>
        </Modal>

        {modalEquipa && (
          <Modal
            visible={modalEquipa}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setModalEquipa(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Entrar na Equipa</Text>
                <Text style={styles.modalDescription}>
                  Tens a certeza de que queres juntar-te à equipa?
                </Text>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalEquipa(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleNext2}
                  >
                    <Text style={styles.confirmButtonText}>Entrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </Container_Pagina_Pricipal>
    </>
  );
}

const styles = StyleSheet.create({
  teamIcon: {
    width: 60,
    height: 60,
    marginRight: 10,
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
  // Estilos do Dropdown
  dropdownWrapper: {
    width: 60,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  dropdownButton: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderColor: "#263A83",
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#263A83",
    textAlign: "center",
    fontWeight: "normal",
  },
  dropdownMenu: {
    textAlign: "center",
    height: 110,
    width: 60,
    borderWidth: 1,
    borderColor: "#263A83",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 10,
  },
});
