import React, { useState } from "react";
import { useFonts } from "expo-font";

import ProgressBar, {
  Container,
  PerguntaContador,
  CaixaQuestionario,
  PerguntaTexto,
  OpcoesContainer,
  SelecionaResposta,
  BotaoOpcao,
  Circulo,
  TextoBotao,
  BotaoNavegacaoContainer,
  BotaoNavegacao,
} from "../styles/styles";

export default function Questionario() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
  });

  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);

  const perguntas = [
    {
      texto: "Qual das seguintes atividades mais te desperta interesse?",
      opcoes: [
        "Aprender algo novo",
        "Trabalhar em equipa",
        "Resolver desafios",
        "Explorar lugares novos",
      ],
    },
    {
      texto: "Como descreverias o teu estado de espírito atual?",
      opcoes: ["Motivado", "Ansioso", "Inspirado", "Cansado"],
    },
    {
      texto: "Como descreverias a tua capacidade de trabalhar em equipa?",
      opcoes: [
        "Colaborativa",
        "Preferência por trabalhar sozinho",
        "Adaptável",
        "Assertiva",
      ],
    },
    {
      texto: "Como descreverias o teu estilo de vida?",
      opcoes: ["Ativo", "Equilibrado", "Sedentário", "Monótono"],
    },
  ];

  const progresso = ((perguntaAtual + 1) / perguntas.length) * 100;

  const avancarPergunta = () => {
    if (perguntaAtual < perguntas.length - 1) {
      setPerguntaAtual(perguntaAtual + 1);
      setRespostaSelecionada(null);
    } else {
      //adicionar aqui a cena para redirecionar para a pag inicial quando set termina o questionario
    }
  };

  const voltarPaginaAnterior = () => {
    if (perguntaAtual > 0) {
      setPerguntaAtual(perguntaAtual - 1);
    }
  };

  const selecionarResposta = (index) => {
    setRespostaSelecionada(index);
  };

  return (
    <Container>
      <PerguntaContador>
        {perguntaAtual + 1} de {perguntas.length}
      </PerguntaContador>
      <ProgressBar progress={progresso} color="#E3FC87" />
      <CaixaQuestionario>
        <PerguntaTexto>{perguntas[perguntaAtual].texto}</PerguntaTexto>
        <SelecionaResposta>Seleciona uma resposta</SelecionaResposta>
        <OpcoesContainer>
          {perguntas[perguntaAtual].opcoes.map((opcao, index) => (
            <BotaoOpcao
              key={index}
              selecionado={respostaSelecionada === index}
              onPress={() => selecionarResposta(index)}
            >
              <Circulo
                selecionado={respostaSelecionada === index}
                style={{
                  backgroundColor:
                    respostaSelecionada === index ? "#263A83" : "#fff",
                  borderColor:
                    respostaSelecionada === index ? "#263A83" : "#ccc",
                  borderWidth: 2,
                }}
              >
                {respostaSelecionada === index && (
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      position: "absolute",
                    }}
                  />
                )}
              </Circulo>
              <TextoBotao>{opcao}</TextoBotao>
            </BotaoOpcao>
          ))}
        </OpcoesContainer>

        <BotaoNavegacaoContainer>
          <BotaoNavegacao onPress={voltarPaginaAnterior}>
            <TextoBotao>Voltar</TextoBotao>
          </BotaoNavegacao>
          <BotaoNavegacao
            onPress={avancarPergunta}
            disabled={respostaSelecionada === null}
            style={{
              backgroundColor:
                respostaSelecionada === null ? "#ccc" : "#263A83",
            }}
          >
            <TextoBotao
              style={{
                color: respostaSelecionada === null ? "#999" : "#fff",
              }}
            >
              {perguntaAtual === perguntas.length - 1 ? "Terminar" : "Seguinte"}
            </TextoBotao>
          </BotaoNavegacao>
        </BotaoNavegacaoContainer>
      </CaixaQuestionario>
    </Container>
  );
}
