import React, { useState } from "react";
import { useFonts } from "expo-font";
import { Svg, Path } from "react-native-svg";
import { Image, View } from "react-native";
import { useRouter } from "expo-router";

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
  CaixaQuestionario2,
  TituloCaixa,
  TextoCaixa,
  BotaoIniciarQuestionario,
  TextoBotaoComecar,
  TextoCaixaFinal,
  TextoCaixaFinalp,
} from "./styles/styles";

export default function Questionario() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [iniciarQuestionario, setIniciarQuestionario] = useState(false);
  const [mostrarSVG, setMostrarSVG] = useState(true);
  const [mostrarFinal, setMostrarFinal] = useState(false);
  const router = useRouter();

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
      setMostrarFinal(true);
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

  const iniciarQuestionarioHandler = () => {
    setIniciarQuestionario(true); // Atualiza o estado para iniciar o questionário
    setMostrarSVG(false);
  };

  const submeterQuestionario = () => {
    return(
      router.push("./PaginaPrincipal") // questionário redireciona para a pagina inicial (equipas)
    )
  };

  return (
    <Container>
      {mostrarSVG && (
        <Svg
          width="390"
          height="432"
          viewBox="0 0 390 432"
          fill="none"
          style={{
            position: "absolute",
            top: -50,
            right: 20,
            zIndex: 0,
          }}
        >
          <Path
            d="M195.045 154.46C195.045 154.46 156.364 131.503 130.411 135.672C113.639 138.366 100.337 143.388 91.0444 154.179C81.752 164.969 74.2625 189.262 82.3201 209.662C91.2269 232.212 114.36 244.909 134.068 243.347C170.82 240.435 183.606 211.219 183.606 211.219L201.082 163.776C201.082 163.776 212.302 125.353 221.278 105.663C224.542 98.5032 236.29 87.0552 250.001 83.3201C270.65 77.6951 289.849 84.1709 300.983 102.448C310.663 118.34 312.716 131.669 305.249 147.957C299.743 159.969 292.467 165.011 280.97 171.526C251.205 188.392 195.045 154.46 195.045 154.46Z"
            stroke="#BFE0FF"
          />
          <Path
            d="M279.566 172.313C292.827 164.986 299.802 159.596 306.376 145.898"
            stroke="#ABC9E4"
          />
          <Path
            d="M167.5 141.5C167.5 141.5 184.835 148.611 193.457 153.678C203.381 159.51 217.988 165.902 217.988 165.902"
            stroke="#ABC9E4"
          />
          <Path
            d="M263.136 220.646L291.191 207.458C291.671 207.232 291.909 206.865 292.004 206.694C292.111 206.503 292.164 206.329 292.191 206.228C292.246 206.02 292.266 205.822 292.276 205.687C292.297 205.401 292.294 205.053 292.28 204.689C292.252 203.943 292.17 202.904 292.046 201.639C291.796 199.097 291.365 195.521 290.806 191.271C289.688 182.766 288.055 171.503 286.329 160.289C284.603 149.076 282.782 137.899 281.29 129.567C280.544 125.404 279.877 121.932 279.342 119.516C279.076 118.316 278.834 117.334 278.623 116.649C278.523 116.322 278.404 115.978 278.263 115.696C278.203 115.576 278.069 115.321 277.838 115.088C277.646 114.895 276.829 114.208 275.766 114.708C274.601 115.256 271.29 116.812 267.232 118.719C260.264 121.994 251.094 126.305 246.806 128.322C246.108 128.65 245.881 129.28 245.832 129.416C245.749 129.647 245.713 129.87 245.694 130.021C245.654 130.339 245.648 130.711 245.655 131.086C245.669 131.856 245.747 132.91 245.872 134.178C246.123 136.729 246.582 140.3 247.183 144.531C248.386 153.001 250.174 164.195 252.058 175.334C253.943 186.474 255.928 197.573 257.528 205.853C258.327 209.989 259.033 213.438 259.584 215.841C259.859 217.036 260.102 218.006 260.306 218.681C260.404 219.006 260.513 219.332 260.634 219.595C260.685 219.707 260.795 219.936 260.98 220.155C261.069 220.261 261.272 220.482 261.604 220.64C261.999 220.829 262.567 220.914 263.136 220.646Z"
            fill="#263A83"
            stroke="#E3FC87"
          />
          <Path
            d="M244.624 174.375C244.624 174.375 257.2 177.52 267.643 175.156"
            stroke="#BFE0FF"
          />
          <Path
            d="M315.033 208.975L295.248 240.929L279.205 229.133L266.91 228.835C266.91 228.835 278.663 218.756 275.805 212.499C274.281 209.162 273.224 205.676 270.487 201.187C265.641 193.238 260.946 187.197 259.426 177.657C258.037 168.937 259.185 164.215 261.777 154.452C263.018 149.78 271.244 155.784 271.244 155.784C271.244 155.784 275.386 161.293 275.018 166.165C274.8 169.059 272.647 171.944 272.467 174.841C272.26 178.177 273.676 180.692 275.178 182.959C277.335 186.215 280.907 186.907 284.971 184.985C289.605 182.795 293.493 177.26 292.766 172.186C292.5 170.327 291.782 167.646 290.114 166.545C287.906 165.086 288.299 162.684 288.299 162.684C288.299 162.684 287.317 157.068 286.946 153.928C286.665 151.555 289.64 152.029 293.837 155.66C298.306 159.527 303.009 164.822 306.473 169.61C310.97 175.827 314.744 176.581 317.99 183.533C320.259 188.391 320.292 192.57 319.775 197.906C319.321 202.587 315.033 208.975 315.033 208.975Z"
            fill="#FAB9A8"
          />
          <Path
            d="M263.149 166.771L258.81 170.468C259.388 164.219 259.888 160.239 262.117 153.997C262.117 153.997 262.378 153.322 263.261 152.906C264.619 152.268 268.212 153.106 268.583 154.824C269.457 158.873 263.149 166.771 263.149 166.771Z"
            fill="#C98573"
          />
          <Path
            d="M101.018 322.548L126.97 377.753C126.97 377.753 211.532 340.21 243.953 322.206C250.568 318.533 262.888 301.533 273.214 286.903C284.552 270.841 298.646 243.455 298.646 243.455C290.308 229.783 284.139 224.845 266.584 228.141C266.584 228.141 255.019 242.652 246.35 250.913C233.149 263.491 223.769 268.358 208.124 277.723C186.511 290.659 173.353 296.263 149.965 305.616C131.185 313.126 101.018 322.548 101.018 322.548Z"
            fill="#E3FC87"
          />
          <Path
            d="M113.568 349.246L127.182 378.206C127.182 378.206 227.129 334.159 244.165 322.659C263.039 309.919 299.311 243.696 299.311 243.696C294.471 235.027 290.571 230.56 284 228.5C284 228.5 249.967 280.244 219.583 303.275C183.621 330.536 113.568 349.246 113.568 349.246Z"
            fill="#C4DB71"
          />
        </Svg>
      )}

      {mostrarFinal ? (
        <View style={{ flex: 1, position: "relative" }}>
          <Image
            accessibilityLabel="Ilustração de um smartphone com uma notificação sobre equipas"
            source={require("../assets/images/Group 677.png")}
            style={{
              position: "absolute",
              top: "0%",
              left: "13%",
              width: 250,
              height: 250,
              zIndex: 0,
              resizeMode: "contain",
            }}
          />
          <CaixaQuestionario2 style={{ position: "relative", zIndex: 1 }}>
            <TituloCaixa>E já está!</TituloCaixa>
            <TextoCaixaFinal>
              Estás pronto para começar a tua jornada com a Offly!{"\n"} {"\n"}
              Cria a tua própria equipa e convida os teus amigos. Não tens uma
              equipa? Junta-te a uma existente.
            </TextoCaixaFinal>
            <BotaoIniciarQuestionario onPress={submeterQuestionario}>
              <TextoBotaoComecar>Vamos lá</TextoBotaoComecar>
            </BotaoIniciarQuestionario>
          </CaixaQuestionario2>
        </View>
      ) : iniciarQuestionario ? (
        // Mostrar o questionário após o clique no botão
        <>
          <PerguntaContador>
            {perguntaAtual + 1} de {perguntas.length}
          </PerguntaContador>
          <ProgressBar progress={progresso} color="#E3FC87" />
          <CaixaQuestionario>
            <PerguntaTexto>{perguntas[perguntaAtual].texto}</PerguntaTexto>
            <SelecionaResposta>Seleciona uma resposta</SelecionaResposta>

            <OpcoesContainer 
              accessibilityRole="radiogroup" 
              accessibilityLabel="Escolha uma opção">
              {perguntas[perguntaAtual].opcoes.map((opcao, index) => (
                <BotaoOpcao
                  key={index}
                  selecionado={respostaSelecionada === index}
                  onPress={() => selecionarResposta(index)}
                  accessibilityRole="radio"
                  accessibilityLabel={opcao}
                  accessibilityState={{ selected: respostaSelecionada === index }}
                >
                  <Circulo selecionado={respostaSelecionada === index}>
                    {respostaSelecionada === index && (
                      <Svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <Path
                          d="M20 6L9 17L4 12"
                          stroke="white"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    )}
                  </Circulo>
                  <TextoBotao selecionado={respostaSelecionada === index}>
                    {opcao}
                  </TextoBotao>
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
                    color: respostaSelecionada === null ? "black" : "#fff",
                  }}
                >
                  {perguntaAtual === perguntas.length - 1
                    ? "Terminar"
                    : "Seguinte"}
                </TextoBotao>
              </BotaoNavegacao>
            </BotaoNavegacaoContainer>
          </CaixaQuestionario>
        </>
      ) : (
        // Mostrar o card inicial antes do questionário
        <CaixaQuestionario2>
          <TituloCaixa>Redescobre o teu tempo com a Offly</TituloCaixa>
          <TextoCaixa>
            Aqui, vais combater em equipa o excesso de tempo de ecrã! Antes de
            começares, responde a um breve questionário para personalizarmos a
            tua experiência.
          </TextoCaixa>
          <BotaoIniciarQuestionario onPress={iniciarQuestionarioHandler}>
            <TextoBotaoComecar>Começar</TextoBotaoComecar>
          </BotaoIniciarQuestionario>
        </CaixaQuestionario2>
      )}
    </Container>
  );
}
