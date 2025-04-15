import * as Clipboard from "expo-clipboard";
import { TextInput } from "react-native";
import { useFonts } from "expo-font";
import React, { useState, useEffect } from "react";
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

  const [equipas, setEquipas] = useState([]);
  const [filteredEquipas, setFilteredEquipas] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [NomeEquipa, setNomeEquipa] = useState("");
  const [DescricaoEquipa, setDescricaoEquipa] = useState("");
  const [activeButton, setActiveButton] = useState(null); // Estado do botão de visibilidade
  const [selectedValue, setSelectedValue] = useState("3");

  const [nomeEquipaError, setNomeEquipaError] = useState("");
  const [descricaoEquipaError, setDescricaoEquipaError] = useState("");
  const [visibilidadeError, setVisibilidadeError] = useState("");

  const [inviteLink, setInviteLink] = useState(null); // Estado para o link de convite

  const options = ["3", "4", "5"];
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const [selectedEquipaId, setSelectedEquipaId] = useState(null);
  const [modalEquipa, setModalEquipa] = useState(false);

  const imageTeamUrls = [
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.50.14-removebg-preview.png",
    "https://celina05.sirv.com/equipasFinal/Screenshot_2025-01-16_at_01.51.27-removebg-preview.png",
    // ... restante das URLs ...
  ];

  const imageUserUrls = [
    "https://celina05.sirv.com/avatares/avatar4.png",
    "https://celina05.sirv.com/avatares/avatar5.png",
    // ... restante das URLs ...
  ];

  const getRandomImage = (tipo) => {
    const randomIndex = Math.floor(Math.random() * tipo.length);
    return tipo[randomIndex];
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
      console.log("Utilizador logado na pag principal", currentUser);
    } else {
      Alert.alert("Erro", "Nenhum utilizador logado!");
    }
  }, []);

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

  useEffect(() => {
    fetchEquipas();
  }, []);

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
      setModalVisible(false);
      router.push({
        pathname: "./EquipaCriada",
        params: { teamId: NomeEquipa },
      });
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
    setModalEquipa(false);
    router.push({
      pathname: "./EquipaCriada",
      params: { teamId: selectedEquipaId },
    });
  };

  const handleButtonClick = (button) => {
    setActiveButton(button);
    if (button) {
      setVisibilidadeError("");
    }

    // Gerar o link de convite apenas quando "Privada" é selecionado
    if (button === "private") {
      const generatedInviteCode = generateInviteCode(); // Função para gerar o código de convite
      const inviteUrl = `https://offly/join-team?invitecode=${generatedInviteCode}`;
      setInviteLink(inviteUrl);
    } else {
      setInviteLink(null); // Limpar o link quando "Pública" for selecionado
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

  // Função para gerar o código de convite aleatório
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

  // Função para copiar o link para a área de transferência
  function copyToClipboard(text) {
    Clipboard.setStringAsync(text);
    Alert.alert("Sucesso", "Link copiado para a área de transferência!");
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
            {/* SVGs das estrelas */}
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
                accessibilityLabel={`${equipa.nome}, ${equipa.currentParticipants} de ${equipa.numparticipantes} participantes`}
              />
            ))
        ) : (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#263A83" />
          </View>
        )}

        <Botoes_Pagina_principal
          accessibilityRole="button"
          style={{ marginTop: 45 }}
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
    backgroundColor: '#E3FC87',
    // É AQUI
    borderColor: "#263A83",
  },
  optionText: {
    fontSize: 16,
    color: "#263A83",
  },
  optionTextSelected: {
    color: "#263A83",
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
    marginBottom: 10, // Adiciona espaço vertical após os botões
  },
});
