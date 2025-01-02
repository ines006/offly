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
  margin-top: 29.61px;
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
`;

// Texto selecionar resposta
export const SelecionaResposta = styled.Text`
  color: #a7a7a7;
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
    props.selecionado ? "1px solid #263A83" : "1px solid #ccc"};
`;

// Texto do botão de opção
export const TextoBotao = styled.Text`
  color: ${(props) => (props.selecionado ? "#263A83" : "#9B9B9B")};
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
  margin-top: 190px;
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
  color: #9b9b9b;
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
  color: #9b9b9b;
  font-size: 14px;
  font-weight: 400;
  margin-top: 29px;
  line-height: 21px;
  width: 263px;
  padding-left: 16px;
  padding-right: 16px;
`;
