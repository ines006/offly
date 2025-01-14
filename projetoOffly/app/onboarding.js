import React, { useState } from "react";
import styled from "styled-components/native";
import { Svg, Path } from "react-native-svg";

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: #263a83;
  align-items: center;
  justify-content: center;
`;

const LogoContainer = styled.View`
  flex: 2;
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #bfe0ff;
  margin-top: 10px;
`;

const Content = styled.View`
  flex: 3;
  align-items: center;
  justify-content: space-evenly;
`;

const Heading = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #e3fc87;
  text-align: center;
`;

const SubHeading = styled.Text`
  font-size: 16px;
  color: #ffffff;
  text-align: center;
  padding: 0 20px;
`;

const Footer = styled.View`
  flex: 1;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 20px 20px;
`;

const Pagination = styled.View`
  flex-direction: row;
  justify-content: center;
`;

const Dot = styled.View`
  width: ${(props) => (props.active ? "12px" : "8px")};
  height: ${(props) => (props.active ? "12px" : "8px")};
  background-color: ${(props) => (props.active ? "#e3fc87" : "#d9d9d9")};
  border-radius: 6px;
  margin: 0 5px;
`;

const TextButton = styled.TouchableOpacity`
  padding: 10px;
`;

const TextButtonLabel = styled.Text`
  color: #d9d9d9;
  font-size: 16px;
  font-weight: bold;
`;

const Button = styled.TouchableOpacity`
  background-color: #e3fc87;
  padding: 10px 15px;
  border-radius: 50px;
`;

const ButtonLabel = styled.Text`
  color: #263a83;
  font-size: 16px;
  font-weight: bold;
`;

// Screens array
const screens = [
  {
    key: "1",
    heading: "OFFLY",
    subheading: "",
    renderContent: () => (
      <Svg width="150" height="150" viewBox="0 0 100 100">
        <Path
          d="M50 5C27.3 5 10 22.3 10 45s17.3 40 40 40 40-17.3 40-40S72.7 5 50 5z"
          fill="#BFE0FF"
        />
      </Svg>
    ),
  },
  {
    key: "2",
    heading: "Bem-vindo à Offly!",
    subheading:
      "Aqui, vais descobrir como podes reduzir o excesso de tempo de ecrã de forma divertida e em equipa!",
    renderContent: () => (
      <Svg width="150" height="150" viewBox="0 0 100 100">
        <Path
          d="M50 5C27.3 5 10 22.3 10 45s17.3 40 40 40 40-17.3 40-40S72.7 5 50 5zm0 70c-16.6 0-30-13.4-30-30S33.4 15 50 15s30 13.4 30 30-13.4 30-30 30z"
          fill="#E3FC87"
        />
      </Svg>
    ),
  },
  {
    key: "3",
    heading: "Junta-te a uma equipa",
    subheading:
      "Forma equipas com os teus amigos ou junta-te a outras para competir. Trabalhem juntos para alcançar a vossa meta!",
    renderContent: () => (
      <Svg width="150" height="150" viewBox="0 0 100 100">
        <Path
          d="M50 5C27.3 5 10 22.3 10 45s17.3 40 40 40 40-17.3 40-40S72.7 5 50 5z"
          fill="#FFD700"
        />
      </Svg>
    ),
  },
  {
    key: "4",
    heading: "Compete em torneios",
    subheading:
      "Desafia-te a passar menos tempo no ecrã e prova que és o melhor.",
    renderContent: () => (
      <Svg width="150" height="150" viewBox="0 0 100 100">
        <Path
          d="M50 5C27.3 5 10 22.3 10 45s17.3 40 40 40 40-17.3 40-40S72.7 5 50 5z"
          fill="#FF6347"
        />
      </Svg>
    ),
  },

  {
    key: "5",
    heading: "Compete em torneios",
    subheading:
      "Desafia-te a passar menos tempo no ecrã e prova que és o melhor.",
    renderContent: () => (
      <Svg width="150" height="150" viewBox="0 0 100 100">
        <Path
          d="M50 5C27.3 5 10 22.3 10 45s17.3 40 40 40 40-17.3 40-40S72.7 5 50 5z"
          fill="#FF6347"
        />
      </Svg>
    ),
  },

  {
    key: "6",
    heading: "Compete em torneios",
    subheading:
      "Desafia-te a passar menos tempo no ecrã e prova que és o melhor.",
    renderContent: () => (
      <Svg width="150" height="150" viewBox="0 0 100 100">
        <Path
          d="M50 5C27.3 5 10 22.3 10 45s17.3 40 40 40 40-17.3 40-40S72.7 5 50 5z"
          fill="#FF6347"
        />
      </Svg>
    ),
  },

  {
    key: "7",
    heading: "Compete em torneios",
    subheading:
      "Desafia-te a passar menos tempo no ecrã e prova que és o melhor.",
    renderContent: () => (
      <Svg width="150" height="150" viewBox="0 0 100 100">
        <Path
          d="M50 5C27.3 5 10 22.3 10 45s17.3 40 40 40 40-17.3 40-40S72.7 5 50 5z"
          fill="#FF6347"
        />
      </Svg>
    ),
  },

  {
    key: "8",
    heading: "Compete em torneios",
    subheading:
      "Desafia-te a passar menos tempo no ecrã e prova que és o melhor.",
    renderContent: () => (
      <Svg width="150" height="150" viewBox="0 0 100 100">
        <Path
          d="M50 5C27.3 5 10 22.3 10 45s17.3 40 40 40 40-17.3 40-40S72.7 5 50 5z"
          fill="#FF6347"
        />
      </Svg>
    ),
  },
];

// Main App Component
const App = () => {
  const [currentScreen, setCurrentScreen] = useState(0);

  const goNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const goBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  return (
    <Container>
      <LogoContainer>
        {screens[currentScreen].renderContent()}
        <Title>{screens[currentScreen].heading}</Title>
      </LogoContainer>
      <Content>
        <Heading>{screens[currentScreen].heading}</Heading>
        <SubHeading>{screens[currentScreen].subheading}</SubHeading>
      </Content>
      <Footer>
        <TextButton onPress={goBack} disabled={currentScreen === 0}>
          <TextButtonLabel>Anterior</TextButtonLabel>
        </TextButton>
        <Pagination>
          {screens.map((_, index) => (
            <Dot key={index} active={index === currentScreen} />
          ))}
        </Pagination>
        <Button onPress={goNext}>
          <ButtonLabel>
            {currentScreen === screens.length - 1 ? "Finalizar" : "Próximo"}
          </ButtonLabel>
        </Button>
      </Footer>
    </Container>
  );
};

export default App;
