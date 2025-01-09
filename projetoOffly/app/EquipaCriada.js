import { useFonts } from "expo-font";

import {
  Container_Pagina_Equipa_Criada,
  Sub_Titulos_Criar_Equipa,
  Titulos_Equipa_Criada,
  Caixa_Equipa_Criada,
  Botoes_Pagina_principal,
  Texto_Botoes_Pagina_principal,
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
        <Botoes_Pagina_principal onPress = { ()=> console.log("ola") }>
        <Texto_Botoes_Pagina_principal>Entrar no Torneio</Texto_Botoes_Pagina_principal>
        </Botoes_Pagina_principal>
      </Caixa_Equipa_Criada>
    </Container_Pagina_Equipa_Criada>
  );
}
