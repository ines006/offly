import { useFonts } from "expo-font";
import React, { useState, useEffect } from "react";
import { Modal, View } from "react-native";
import ModalDropdown from "react-native-modal-dropdown";
import { Svg, Path } from "react-native-svg";
import { useRouter } from "expo-router";
import InfoEquipas from "./data/InfoEquipas.json";
import Card_Equipa from "./components/Equipas";

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
  DropdownContainer,
  // DropdownButton,
  // DropdownButtonText,
  // DropdownStyle,
  // DropdownItemText,
  Definir_visibilidade_btn,
  SearchInput,
  SearchBarContainer,
} from "./styles/styles";

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
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [NomeEquipa, setNomeEquipa] = useState("");
  const [DescricaoEquipa, setDescricaoEquipa] = useState("");
  const [Invcode, setInvcode] = useState("https://offly/join-team?invitecode");
  const [activeButton, setActiveButton] = useState(null);
  const [selectedValue, setSelectedValue] = useState("3");
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  const options = ["3", "4", "5"];
  const router = useRouter();

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

  const handleNext = () => {
    if (!isNextDisabled) {
      console.log("Team Name:", NomeEquipa);
      console.log("Descrição:", DescricaoEquipa);
      router.push("./EquipaCriada");
      setModalVisible(false);
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
    <Container_Pagina_Pricipal>
      <Titulos>Começa a competir</Titulos>
      <Sub_Titulos>Junta-te a uma equipa</Sub_Titulos>

      <SearchBarContainer>
        <SearchIcon />
        <SearchInput placeholder="Pesquisa equipas" placeholderTextColor="rgba(38, 58, 131, 0.5)" />
      </SearchBarContainer>

      {InfoEquipas.map((team, index) => (
        <Card_Equipa
          key={index}
          onPress={() => console.log(`Selected team: ${team.name}`)}
          icon={team.iconSvg}
          teamName={team.name}
          playerCount={`${team.currentParticipants}/${team.maxParticipants}`}
        />
      ))}

      <Botoes_Pagina_principal style={{ marginTop: 45 }} onPress={Criar_Equipa}>
        <Texto_Botoes_Pagina_principal>Criar equipa</Texto_Botoes_Pagina_principal>
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
  );
}
