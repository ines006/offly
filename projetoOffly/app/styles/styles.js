import styled from "styled-components/native";

// Container principal do questionário
export const Container = styled.View`
  flex: 1;
  padding: 80px;
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
  margin-top: 69.61px;
  justify-content: space-between;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

// Texto das perguntas
export const PerguntaTexto = styled.Text`
  width: 269px;
  font-family: "Poppins-Regular";
  color: #414141;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

// Texto selecionar resposta
export const SelecionaResposta = styled.Text`
  color: #a7a7a7;
  text-align: justify;
  font-family: "Poppins-Regular";
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
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
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-align: center;
`;

export const PerguntaContador = styled.Text`
  color: white;
  text-align: justify;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 25px;
  margin-bottom: 36px;
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
  border: 0.5px solid #9b9b9b;
  border-radius: 8px;
  justify-content: flex-start;
  margin-bottom: 21px;
`;

// Círculo que representa a seleção
export const Circulo = styled.View`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
  border: ${(props) => (props.selecionado ? "0.5px solid #263A83" : "#9B9B9B")};
`;

// Texto do botão de opção
export const TextoBotao = styled.Text`
  color: ${(props) => (props.selecionado ? "#fff" : "#9B9B9B")};
  font-family: "Poppins-Regular";
  font-size: 12px;
  font-weight: 500;
  text-align: left;
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
