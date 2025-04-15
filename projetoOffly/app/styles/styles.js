import styled from "styled-components/native";

// Container principal do questionário
export const Container = styled.View`
  flex: 1;
  padding: 60px;
  align-items: center;
  background-color: #263a83;
`;

// Container da Barra de Progresso
const ProgressBarContainer = styled.View`
  width: 331px;
  height: 9.39px;
  background-color: #7f89ad;
  border-radius: 34px;
  overflow: hidden;
`;

// Barra de Progresso Dinâmica
const Progress = styled.View`
  width: ${(props) => props.progress}%;
  height: 100%;
  background-color: ${(props) => props.color || "#76c7c0"};
  border-radius: 34px;
`;

// Componente de Barra de Progresso
const ProgressBar = ({ progress, color }) => {
  return (
    <ProgressBarContainer>
      <Progress progress={progress} color={color} />
    </ProgressBarContainer>
  );
};

export default ProgressBar;

// --------------------------------------

// Caixa do questionário
export const CaixaQuestionario = styled.View`
  width: 329px;
  border-radius: 20px;
  background-color: #fff;
  padding: 20px;
  
  margin-top: 100px;
  justify-content: space-between;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

// Texto das perguntas
export const PerguntaTexto = styled.Text`
  font-family: "Poppins-Regular";
  color: #414141;
  font-size: 14px;
  font-weight: bold;
`;

// Texto selecionar resposta
export const SelecionaResposta = styled.Text`
  color: #414141;
  text-align: justify;
  font-family: "Poppins-Regular";
  font-size: 12px;
  height: 34px;
  margin-top: 6px;
  margin-bottom: 20px;
`;

// Opções de resposta
export const OpcoesContainer = styled.View`
  font-family: "Poppins-Regular";
  font-size: 5px;
  width: 100%;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
`;

// Botão opções
export const StyledButton = styled.TouchableOpacity`
  width: 280px;
  height: 20px;
  border-radius: 10px;
  border: 0.5px solid #959595;
  background: #fff;
  margin-bottom: 21px;
  align-items: center;
  justify-content: center;
`;

// Texto do botão de opções
export const ButtonText = styled.Text`
  width: 219px;
  height: 18px;
  color: #959595;
  font-size: 12px;
  font-weight: 400;
  text-align: center;
`;

export const PerguntaContador = styled.Text`
  color: white;
  text-align: justify;
  font-size: 15px;
  font-weight: 400;
  line-height: 25px;
  margin-bottom: 20px;
  margin-top: 20px;
`;

// Botão de opção (com círculo e mudança de cor ao ser selecionado)
export const BotaoOpcao = styled.TouchableOpacity`
  width: 100%;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  font-family: "Poppins-Regular";
  font-size: 12px;
  background-color: ${(props) => (props.selecionado ? "#E3FC87" : "#fff")};
  border: 0.5px solid #585858;
  border-radius: 8px;
  justify-content: flex-start;
  margin-bottom: 21px;
`;

// Círculo do botão
export const Circulo = styled.View`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.selecionado ? "#263A83" : "#fff")};
  border: ${(props) =>
    props.selecionado ? "1px solid #263A83" : "1px solid #585858"};
`;

// Texto do botão de opção
export const TextoBotao = styled.Text`
  color: ${(props) => (props.selecionado ? "#263A83" : "#585858")};
  font-family: "Poppins-Regular";
  font-size: 12px;
`;

// Container para os botões de navegação (Voltar e Seguinte)
export const BotaoNavegacaoContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
`;

// Botão de navegação (Voltar ou Avançar)
export const BotaoNavegacao = styled.TouchableOpacity`
  display: flex;
  height: 47.436px;
  padding: 7px 34px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background: rgb(255, 255, 255);
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  width: 48%;
`;

export const TextoBotaoNavegacao = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

//-------------------------

// Caixa do questionário
export const CaixaQuestionario2 = styled.View`
  width: 329px;
  border-radius: 20px;
  background-color: #fff;
  margin-top: 29.61px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;

  elevation: 5;
  margin-top: 240px;
  height: 430px;
  align-items: center;
`;

export const TituloCaixa = styled.Text`
  color: #263a83;
  font-size: 30px;
  font-weight: 700;
  margin-top: 77px;
  line-height: 33px;
  width: 257px;
  padding-left: 16px;
  padding-right: 16px;
`;

export const TextoCaixa = styled.Text`
  color: #414141;
  font-size: 14px;
  font-weight: 400;
  margin-top: 29px;
  line-height: 21px;
  width: 263px;
  padding-left: 16px;
  padding-right: 16px;
`;

export const BotaoIniciarQuestionario = styled.TouchableOpacity`
  display: flex;
  width: 240px;
  height: 39px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  background: #263a83;
  margin-top: 23px;
`;

export const TextoBotaoComecar = styled.Text`
  color: #fff;
  font-size: 15px;
`;

export const TextoCaixaFinal = styled.Text`
  color: #414141;
  font-size: 14px;
  font-weight: 400;
  margin-top: 29px;
  line-height: 21px;
  width: 263px;
  padding-left: 16px;
  padding-right: 16px;
`;

//---------------------

//Página Principal

export const CardContainer = styled.View`
  background-color: #27368f;
  border-radius: 16px;
  padding: 3px;
  width: 90%;
  align-self: center;
  margin-vertical: 20px;
  position: relative;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const IconContainer = styled.View`
  background-color: #ffffff;
  border-radius: 50px;
  height: 32px;
  width: 32px;
  justify-content: center;
  align-items: center;
`;

export const TeamName = styled.Text`
  font-size: 17px;
  color: #27368f;
  font-weight: bold;
  background-color: white;
  padding-horizontal: 12px;
  padding-vertical: 4px;
  border-radius: 12px;
`;

export const Points = styled.Text`
  font-size: 16px;
  color: #d4f34a;
  font-weight: bold;
`;

export const Stats = styled.View``;

export const StatItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-radius: 20px;
  border-color: white;
  border-width: 2px;
  padding: 10px;
  margin: 10px;
`;

export const StatText = styled.Text`
  font-size: 14px;
  color: #ffffff;
`;

export const StatValue = styled.Text`
  font-size: 14px;
  color: #ffffff;
  flex-direction: row;
  align-items: center;
`;

export const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
`;

export const FooterText = styled.Text`
  font-size: 12px;
  color: #ffffff;
  text-align: right;
  margin-right: 10px;
  flex: 1;
`;

export const BottomCircle = styled.TouchableOpacity`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: #27368f;
  border-width: 4px;
  border-color: #ffffff;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: -32px;
  align-self: center;
`;

export const TittleTorneio = styled.Text`
  font-size: 24px;
  font-weight: 600;
  color: #263a83;
  margin-bottom: 10;
  margin-top: 15;
  text-align: left;
  width: 90%;
  align-self: center;
`;

export const TittlePagina = styled.Text`
`;

export const CardsDesafios = styled.View`
  background-color: #27368f;
  border-radius: 16px;
  padding: 16px;
  width: 50%;
  align-self: center;
  margin-vertical: 20px;
`;

//exp
export const DesafioContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 90%;
  align-self: center;
  margin-top: 10px;
`;
export const DesafioCard = styled.TouchableOpacity`
  background-color: #27368f;
  border-radius: 16px;
  padding: 16px;
  width: 48%;
  align-items: center;
  height: 150px;
  justify-content: center;
`;
export const DesafioIcon = styled.View`
  margin-bottom: 10px;
`;
export const DesafioText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: 350;
  text-align: center;
`;

export const NomeUtilizador = styled.Text`
  font-size: 19px;
  font-weight: 600;
  color: #414141;
  margin-bottom: 10;
  margin-top: 15;
  text-align: left;
  width: 90%;
  align-self: center;
`;

//Perfil pag inicial

export const ProfileContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 20px;
  width: 100%;
  align-self: center;
  margin-top:7%;
`;

export const Avatar = styled.Image.attrs({
  accessibilityLabel: 'Imagem de perfil do utilizador'
})`
  width: 70px;
  height: 70px;
  border-radius: 100px;
  margin-right: 15px;
`;


export const ProfileTextContainer = styled.View`
  flex: 1;
`;

export const UserName = styled.Text`
  font-size: 19px;
  font-weight: 600;
  color: #333;
`;

export const UserLevel = styled.Text`
  font-size: 14px;
  color: #666;
`;

export const StarsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
`;

export const Star = styled.View`
  margin-left: 5px;
`;

// PÁGINA PRINCIPAL ESTILOS

// Container
export const Container_Pagina_Principal = styled.View`
  display: flex;
  flex: 1;
  padding: 10px 27px 27px 27px;
  align-items: center;
  background-color: white;
`;

// Titulos
export const Titulos = styled.Text`
  font-family: "Poppins-Regular";
  color: #414141;
  font-size: 22px;
  font-weight: 600;
  align-self: flex-start;
`;

// Sub Titulos
export const Sub_Titulos = styled.Text`
  color: #414141;
  font-family: Poppins-regular;
  font-size: 15px;
  font-weight: 400;
  align-self: flex-start;
`;

export const Botoes_Pagina_principal = styled.TouchableOpacity`
  display: flex;
  max-width: 240px;
  height: 39px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  background: #263a83;
  margin-top: 23px;
  padding: 7px 31px;
`;

export const Texto_Botoes_Pagina_principal = styled.Text`
  color: white;
  font-family: Poppins-regular;
  font-size: 15px;
  font-weight: 600;
`;

export const Botoes_Pagina_principal_Desativado = styled.View`
  display: flex;
  max-width: 240px;
  height: 39px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  background: #fff;
  margin-top: 23px;
  padding: 7px 31px;
  border: 1px solid #263a83;
`;

export const Texto_Botoes_Pagina_principal_Desativado = styled.Text`
  color: #263a83;
  font-family: Poppins-regular;
  font-size: 15px;
  font-weight: 600;
`;

export const Texto_Botoes_Pagina_principal_Voltar = styled.Text`
  color: #414141;
  font-family: poppins-regular;
  font-size: 15px;
  font-weight: 400;
`;

export const Caixa_de_texto = styled.TextInput`
  min-width: 280px;
  height: 33px;
  border-radius: 10px;
  border: 1px solid #263a83;
  padding: 10px;
  margin-top: 10px;
  color: hsl(0, 0%, 0%);
  text-align: justify;
  font-family: Poppins-regular;
  font-size: 12px;
  font-weight: 400;
`;

export const Titulos_Criar_Equipa = styled.Text`
  color: #414141;
  font-family: Poppins-regular;
  font-size: 15px;
  font-weight: 400;
  margin-top: 20px;
`;

export const DropdownContainer = styled.View`
  width: 150px;
`;

export const DropdownButton = styled.TouchableOpacity`
  width: 62px;
  height: 25px;
  margin-top: 10px;
  border: 1px solid #263a83;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  background-color: white;
`;

export const DropdownButtonText = styled.Text`
  color: #263a83;
  font-size: 16px;
`;

export const DropdownStyle = styled.View`
  width: 150px;
  border: 1px solid #263a83;
  border-radius: 8px;
  background-color: white;
  position: absolute;
  top: 40px; /* Adjust to push the dropdown below the button */
`;

export const DropdownItemText = styled.Text`
  color: #414141;
  font-size: 16px;
  padding: 10px;
  text-align: center;
`;

export const Definir_visibilidade_btn = styled.TouchableOpacity`
  min-width: 114px;
  min-height: 35px;
  display: flex;
  padding: 7px;
  margin-top: -10;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
  border-radius: 10px;
  background: transparent;
  border-color: #263a83;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

export const Texto_Botoes_Definir_Visibilidade = styled.Text`
  color: #263a83;
  font-family: poppins-regular;
  font-size: 15px;
  font-weight: 400;
`;
// PESQUISAR EQUIPAS

export const SearchBarContainer = styled.View`
  flex-direction: row;
  display: flex;
  width: 330px;
  height: 49px;
  padding: 7px 15px;
  align-items: center;
  gap: 10px;

  border-radius: 10px;
  border: 1px solid #263a83;
  margin-top: 24px;
  margin-bottom: 29px;
`;

export const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: #1a237e;
`;

// EQUIPA CRIADA

// Container
export const Container_Pagina_Equipa_Criada = styled.View`
  margin-top: 80;
  padding: 60px 27px 27px 27px;
  align-items: center;
  background-color: white;
`;

// Titulos Criar Equipa
export const Titulos_Equipa_Criada = styled.Text`
  color: #263a83;
  font-family: Poppins-bold;
  font-size: 30px;
  font-weight: 800;
  margin-top: 10px;
  align-self: center;


`;

// Sub Titulos Criar Equipa
export const Sub_Titulos_Criar_Equipa = styled.Text`
  color: #414141;
  font-family: Poppins-semibold;
  font-size: 15px;
  font-weight: 400;
  align-self: center;
  margin-top: 10;
  margin-bottom:20;
`;

// Container participantes
export const Member_Container = styled.View`
  flex: 1;
  background-color: #263a83;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
  padding-bottom: 15px;
  width: 370px;
  align-self: center;
  margin-top: 30px;
  margin-bottom: 30px;
`;

export const Member_Card = styled.View`
  flex-direction: row;
  padding: 15px;
  width: 330px;
  margin-vertical: 8px;
  margin-horizontal: 10px;
  background-color: #263a83;
  border-radius: 20px;
  align-items: center;
  text-align: center;
  align-self: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 3px;
  elevation: 5;
  height: 75px;
`;

export const Member_Image = styled.Image`
  width: 60px;
  height: 60px;
`;

export const Member_Text = styled.Text`
  font-size: 16px;
  color: #fff;
  margin-left: 10px;
  font-weight: bold;
`;

export const NoMember_Container = styled.View`
  flex: 1;
  background-color: #e6eaf2;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  width: 370px;
  height: 71px;
  align-self: center;
  margin-top: 30px;
  margin-bottom: 30px;
`;

export const NoMember_Text = styled.Text`
  font-size: 30px;
  color: #263a83;
  letter-spacing: 5px;
  font-weight: bold;
`;

// Caixa do questionário
export const Caixa_Equipa_Criada = styled.View`
  width: 329px;
  border-radius: 20px;
  background-color: #f1f1f1;
  padding: 20px;
  margin-top: 29.61px;
  justify-content: space-between;
  align-items: center;
`;
