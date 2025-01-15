import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

const Card_Equipa = ({ onPress, icon, teamName, playerCount }) => {
    return (
      <CardContainer onPress={onPress}>
        <IconWrapper>
          <Icon>{icon}</Icon>
        </IconWrapper>
        <CardText>{teamName}</CardText>
        <MemberCount>{playerCount}</MemberCount>
      </CardContainer>
    );
  };

export default Card_Equipa;

// Styled components
const CardContainer = styled(TouchableOpacity)`
  width: 330px;
  height: 75px;
  background-color: #263a83;
  border-radius: 15px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 18px
`;

const IconWrapper = styled.View`
  width: 40px;
  height: 40px;
  background-color: #ffffff;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`;  

const Icon = styled.Text`
  font-size: 24px;
  color: #263a83;
`;

const CardText = styled.Text`
  font-size: 18px;
  color: #ffffff;
  font-weight: bold;
  font-family: Poppins-regular;
`;

const MemberCount = styled.Text`
  font-size: 16px;
  color: #ffffff;
  font-family: Poppins-regular;
`;