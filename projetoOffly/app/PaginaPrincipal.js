import { useFonts } from "expo-font";
import React, { useState } from "react";
import { Modal, View } from "react-native";
import ModalDropdown from "react-native-modal-dropdown";

import {
  Container_Pagina_Pricipal,
  Sub_Titulos,
  Titulos,
  Botoes_Pagina_principal,
  Texto_Botoes_Pagina_principal,
  CaixaQuestionario,
  BotaoNavegacaoContainer,
  Texto_Botoes_Pagina_principal_Voltar,
  Caixa_de_texto,
  Titulos_Criar_Equipa,
  //   DropdownContainer,
  //   DropdownButton,
  //   DropdownButtonText,
  //   DropdownStyle,
  //   DropdownItemText,
  Definir_visibilidade_btn,
} from "./styles/styles";

function Text_Inputs(props) {
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

  const Criar_Equipa = () => {
    setModalVisible(true);
  };

  const handleNext = () => {
    console.log("Team Name:", NomeEquipa);
    console.log("Descrição:", DescricaoEquipa);
    console.log("invite code:", Invcode);
    setModalVisible(false);
  };

  const [activeButton, setActiveButton] = useState(null);
  const handleButtonClick = (button) => {
    setActiveButton(button);
  };

//   const [selectedValue, setSelectedValue] = useState("3");

//   const options = ["3", "4", "5"];

  return (
    <Container_Pagina_Pricipal>
      <Titulos>Começa a competir</Titulos>
      <Sub_Titulos>Junta-te a uma equipa</Sub_Titulos>

      <Botoes_Pagina_principal onPress={Criar_Equipa}>
        <Texto_Botoes_Pagina_principal>
          Criar equipa{" "}
        </Texto_Botoes_Pagina_principal>
      </Botoes_Pagina_principal>

      {/* Modal */}
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

            <Text_Inputs
              titulo="Dá um nome à tua equipa"
              placeholder="Exemplo: Os incríveis"
              value={NomeEquipa}
              onChangeText={(text) => setNomeEquipa(text)}
              editable={true}
            />

            <Text_Inputs
              titulo="Adiciona uma descrição"
              placeholder="Exemplo: Vamos ganhar!"
              value={DescricaoEquipa}
              onChangeText={(text) => setDescricaoEquipa(text)}
              editable={true}
            />

            <View>
              <Titulos_Criar_Equipa>
                Define a quantidade de participantes
              </Titulos_Criar_Equipa>
              {/* <DropdownContainer>
                  <ModalDropdown
                    options={options}
                    defaultValue={selectedValue}
                    style={{ borderWidth: 0 }} 
                    dropdownStyle={{
                      width: 150, // Match your DropdownStyle
                      borderWidth: 1,
                      borderColor: "#263a83",
                      borderRadius: 8,
                      backgroundColor: "white",
                    }}
                    renderButtonText={(rowData) => (
                      <DropdownButton>
                        <DropdownButtonText>{rowData}</DropdownButtonText>
                      </DropdownButton>
                    )}
                    renderRow={(rowData, rowID, highlighted) => (
                      <DropdownItemText
                        style={{
                          backgroundColor: highlighted ? "#f0f0f0" : "white", 
                        }}
                      >
                        {rowData}
                      </DropdownItemText>
                    )}
                  />
                </DropdownContainer> */}
            </View>

            <View>
              <Titulos_Criar_Equipa>
                Define a visibilidade da tua equipa
              </Titulos_Criar_Equipa>

              <BotaoNavegacaoContainer>
                <Definir_visibilidade_btn style={{
            backgroundColor: activeButton === 'public' ? '#E3FC87' : 'transparent',}}
            onPress={() => handleButtonClick('public')}>
                  <Texto_Botoes_Pagina_principal_Voltar>
                    Pública
                  </Texto_Botoes_Pagina_principal_Voltar>
                </Definir_visibilidade_btn>

                <Definir_visibilidade_btn style={{
            backgroundColor: activeButton === 'private' ? '#E3FC87' : 'transparent',}} onPress={() => handleButtonClick('private')}>
                  <Texto_Botoes_Pagina_principal_Voltar>
                    Privada
                  </Texto_Botoes_Pagina_principal_Voltar>
                </Definir_visibilidade_btn>
              </BotaoNavegacaoContainer>
            </View>

            <Text_Inputs
              titulo="Convida os teus amigos"
              placeholder="Exemplo: Vamos ganhar!"
              value={Invcode}
              onChangeText={(text) => setInvcode(text)}
              editable={false}
            />

            <BotaoNavegacaoContainer>
              <Botoes_Pagina_principal
                style={{ backgroundColor: "transparent" }}
                onPress={() => setModalVisible(false)}
              >
                <Texto_Botoes_Pagina_principal_Voltar>
                  Voltar
                </Texto_Botoes_Pagina_principal_Voltar>
              </Botoes_Pagina_principal>

              <Botoes_Pagina_principal>
                <Texto_Botoes_Pagina_principal onPress={handleNext}>
                  seguinte
                </Texto_Botoes_Pagina_principal>
              </Botoes_Pagina_principal>
            </BotaoNavegacaoContainer>
          </CaixaQuestionario>
        </View>
      </Modal>
    </Container_Pagina_Pricipal>
  );
}
