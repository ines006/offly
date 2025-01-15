import { useFonts } from "expo-font";
import React, { useState, useEffect } from "react";
import { Modal, Text, View, Image, StyleSheet, ActivityIndicator } from "react-native";
import ModalDropdown from "react-native-modal-dropdown";
import { Svg, Path } from "react-native-svg";
import { useRouter } from "expo-router";
import Card_Equipa from "./components/Equipas-copy";
// Firebase Imports
import { collection, getDocs, addDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebaseApi";
import {
  Container_Pagina_Pricipal,
  Container_Pagina_Pricipal_2,
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
  DropdownContainer,
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
  return (
    <View>
      <Titulos_Criar_Equipa>{props.titulo}</Titulos_Criar_Equipa>
      <Caixa_de_texto
        value={props.value}
        placeholder={props.placeholder}
        onChangeText={props.onChangeText}
        editable={props.editable}
      />
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
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  const options = ["3", "4", "5"];
  const router = useRouter();

  // Função para buscar equipas da DB
  const fetchEquipas = async () => {
    try {
      const equipasCollectionRef = collection(db, "equipas");
      const querySnapshot = await getDocs(equipasCollectionRef);

      const equipaData = [];

      for (const equipaDoc of querySnapshot.docs) {
        const equipa = { id: equipaDoc.id, ...equipaDoc.data() };

        const membrosCollectionRef = collection(db, `equipas/${equipaDoc.id}/membros`);
        const membrosSnapshot = await getDocs(membrosCollectionRef);

        let currentParticipants = 0;
        membrosSnapshot.forEach((membroDoc) => {
          if (membroDoc.id === "participantes") {
            currentParticipants = Object.keys(membroDoc.data()).length;
          }
        });

        equipaData.push({ ...equipa, currentParticipants });
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
    const filtered = equipas.filter((equipa) =>
      equipa.nome && equipa.nome.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredEquipas(filtered);
  }, [searchText, equipas]);


// Função para criar a equipa na Firebase
const criarEquipa = async () => {
  try {
    const equipaData = {
      nome: NomeEquipa,
      descricao: DescricaoEquipa,
      numparticipantes: parseInt(selectedValue), // Convertendo o valor selecionado para número
      visibilidade: activeButton === 'public' ? 'publica' : 'privada', // Verifica a visibilidade com base no botão selecionado
      adquiridos: 0, // Valor inicial
      pontos: 0, // Valor inicial
      imagem: 'https://celina05.sirv.com/equipas/participante1.png', // Imagem padrão
    };

    // Adiciona a nova equipa à coleção "equipas"
    await addDoc(collection(db, "equipas"), equipaData);

    console.log("Equipa criada com sucesso!");
    setModalVisible(false);
  } catch (error) {
    console.error("Erro ao criar a equipa:", error);
  }
};

  // Validação dos inputs
  const validateInputs = () => {
    if (
      NomeEquipa.trim() !== "" &&
      DescricaoEquipa.trim() !== "" &&
      activeButton !== null &&
      selectedValue !== ""
    ) {
      setIsNextDisabled(false);
    } else {
      setIsNextDisabled(true);
    }
  };

  useEffect(() => {
    validateInputs();
  }, [NomeEquipa, DescricaoEquipa, activeButton, selectedValue]);

  // Certifica-se de que as fontes foram carregadas antes de renderizar
  if (!fontsLoaded) {
    return <Text>Carregando...</Text>;
  }

  const handleNext = () => {
    if (!isNextDisabled) {
      criarEquipa(); // Chama a função para criar a equipa no Firebase
      setModalVisible(false);
      router.push("./EquipaCriada"); // Redireciona para a página da equipa criada
    }
  };
  

  const handleButtonClick = (button) => {
    setActiveButton(button);
  };

  const Criar_Equipa = () => {
    setModalVisible(true);
  };

  const SearchIcon = () => (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="#263A83">
      <Path
        d="M10.5 2a8.5 8.5 0 1 0 5.53 15.03l3.7 3.7a1.5 1.5 0 1 0 2.12-2.12l-3.7-3.7A8.5 8.5 0 0 0 10.5 2zm0 3a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z"
        fill="#1a237e"
      />
    </Svg>
  );

  return (
<>
{/* Perfil */} {/*  para desenrascar meti assim o perfil do user */}
<ProfileContainer style={{ paddingTop: 65, backgroundColor: "#fff" }}>
<Avatar
  source={{
    uri: "https://celina05.sirv.com/equipas/participante1.png",
  }}
/>
<ProfileTextContainer>
  <UserName>Pedro Martins</UserName> <UserLevel>Nível 1</UserLevel>
  <StarsContainer>
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

    <Container_Pagina_Pricipal>
      <Titulos>Começa a competir</Titulos>
      <Sub_Titulos>Junta-te a uma equipa</Sub_Titulos>

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

      {/* Mostra as equipas filtradas */}
      {filteredEquipas.length > 0 ? (
        filteredEquipas.slice(0, 4).map((equipa) => (
          <Card_Equipa
            key={equipa.id}
            onPress={() => console.log(`Selected team: ${equipa.nome}`)}
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

      <Botoes_Pagina_principal style={{ marginTop: 45 }} onPress={Criar_Equipa}>
        <Texto_Botoes_Pagina_principal>Criar equipa</Texto_Botoes_Pagina_principal>
      </Botoes_Pagina_principal>

      {/* Modal para criar equipa */}
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
                  <Titulos>Criar Equipa</Titulos>
      
                  <Caixas_de_Texto_Criar_Equipa 
                    titulo="Dá um nome à tua equipa"
                    placeholder="Exemplo: Os incríveis"
                    value={NomeEquipa}
                    onChangeText={setNomeEquipa}
                    editable={true}
                  />
      
                  <Caixas_de_Texto_Criar_Equipa
                    titulo="Adiciona uma descrição"
                    placeholder="Exemplo: Vamos ganhar!"
                    value={DescricaoEquipa}
                    onChangeText={setDescricaoEquipa}
                    editable={true}
                  />
      
                  <View>
                    <Titulos_Criar_Equipa>Define a quantidade de participantes</Titulos_Criar_Equipa>
                    <DropdownContainer>
                      <ModalDropdown
                        options={options}
                        defaultValue={selectedValue}
                        style={{ borderWidth: 0 }}
                        dropdownStyle={{
                          width: 150,
                          borderWidth: 1,
                          borderColor: "#263a83",
                          borderRadius: 8,
                          backgroundColor: "white",
                        }}
                        onSelect={(index, value) => setSelectedValue(value)}
                      />
                    </DropdownContainer>
                  </View>
      
                  <View>
                    <Titulos_Criar_Equipa>Define a visibilidade da tua equipa</Titulos_Criar_Equipa>
                    <BotaoNavegacaoContainer>
                      <Definir_visibilidade_btn
                        style={{
                          backgroundColor: activeButton === "public" ? "#E3FC87" : "transparent",
                        }}
                        onPress={() => handleButtonClick("public")}
                      >
                        <Texto_Botoes_Definir_Visibilidade>Pública</Texto_Botoes_Definir_Visibilidade>
                      </Definir_visibilidade_btn>
                      <Definir_visibilidade_btn
                        style={{
                          backgroundColor: activeButton === "private" ? "#E3FC87" : "transparent",
                        }}
                        onPress={() => handleButtonClick("private")}
                      >
                        <Texto_Botoes_Definir_Visibilidade>Privada</Texto_Botoes_Definir_Visibilidade>
                      </Definir_visibilidade_btn>
                    </BotaoNavegacaoContainer>
                  </View>
      
                  <BotaoNavegacaoContainer>
                    <Botoes_Pagina_principal
                      style={{ backgroundColor: "transparent" }}
                      onPress={() => setModalVisible(false)}
                    >
                      <Texto_Botoes_Pagina_principal_Voltar>Voltar</Texto_Botoes_Pagina_principal_Voltar>
                    </Botoes_Pagina_principal>
      
                    <Botoes_Pagina_principal
                      style={{ backgroundColor: isNextDisabled ? "gray" : "#263A83" }}
                      disabled={isNextDisabled}
                      onPress={handleNext}
                    >
                      <Texto_Botoes_Pagina_principal>seguinte</Texto_Botoes_Pagina_principal>
                    </Botoes_Pagina_principal>
                  </BotaoNavegacaoContainer>
                </CaixaQuestionario>
              </View>
            </Modal>
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
});
