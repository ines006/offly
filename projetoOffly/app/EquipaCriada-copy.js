import { useFonts } from "expo-font";
import participants from "./data/participants.json";
import {
  View,
  Text,
  Image,
} from "react-native";
import {
  Container_Pagina_Equipa_Criada,
  Sub_Titulos_Criar_Equipa,
  Titulos_Equipa_Criada,
  Caixa_Equipa_Criada,
  Botoes_Pagina_principal,
  Texto_Botoes_Pagina_principal,
  Member_Container,
  Member_Card,
  Member_Image,
  Member_Text,
  NoMember_Container,
  NoMember_Text
} from "./styles/styles";

export default function EquipaCriada() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  return (
    <Container_Pagina_Equipa_Criada>
      <Titulos_Equipa_Criada> Equipa K </Titulos_Equipa_Criada>
      <Sub_Titulos_Criar_Equipa>Vamos ser a melhor equipa!</Sub_Titulos_Criar_Equipa>

      <Caixa_Equipa_Criada>

      <Member_Container>
      {participants.length > 0 ? (
        participants.map((participant, index) => (
          <Member_Card key={index}>
            <Member_Image
              source={require("./imagens/2.png")} 
            />
            <Member_Text>
              {participant.name}
            </Member_Text>
          </Member_Card>
        ))
          ) : (
            <NoMember_Container>
              <Text>Nenhum participante encontrado.</Text>
            </NoMember_Container>
          )}
      </Member_Container>

    
        <Botoes_Pagina_principal onPress = { ()=> console.log("entrar") }>
        <Texto_Botoes_Pagina_principal>Entrar no Torneio</Texto_Botoes_Pagina_principal>
        </Botoes_Pagina_principal>
      </Caixa_Equipa_Criada>

    </Container_Pagina_Equipa_Criada>
  );
}
