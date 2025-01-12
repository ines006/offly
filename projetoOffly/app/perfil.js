import React, { useState } from 'react';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity, Text, View, Image, Svg, Dimensions, StyleSheet } from 'react-native';
import avatarperfil from '../assets/images/avatarperfil.png';
import { Alert } from 'react-native';


const ProfileScreen = () => {
  // States para armazenar os valores dos campos e de edição
  const [name, setName] = useState('Pedro Martins');
  const [username, setUsername] = useState('pedro_martins');
  const [email, setEmail] = useState('pedro.martins@gmail.com');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  // Função para finalizar edição
  const handleSave = (field) => {
    if (field === 'name') setIsEditingName(false);
    if (field === 'username') setIsEditingUsername(false);
    if (field === 'email') setIsEditingEmail(false);

    Alert.alert('Sucesso', 'Alteração salva!');
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={() => Alert.alert('Voltar', 'Voltar para a página anterior')}>
          <Icon name="arrow-back" size={24} color="#263A83" />
        </BackButton>
        <HeaderTitle>Perfil</HeaderTitle>
      </Header>

      <AvatarContainer>
        <Avatar source={require('../assets/images/avatarperfil.png')} />
        <LevelText>Nível 1</LevelText>
        <Stars>
          <Icon name="star" size={20} color="#263A83" />
          <Icon name="star" size={20} color="#ccc" />
          <Icon name="star" size={20} color="#ccc" />
          <Icon name="star" size={20} color="#ccc" />
        </Stars>
      </AvatarContainer>

      <Form>
        <Row>
          <Label>Nome</Label>
          <InputRow>
            <Input
              value={name}
              editable={isEditingName}
              onChangeText={setName}
              style={isEditingName ? { borderBottomWidth: 1, borderBottomColor: '#263A83' } : {}}
            />
            <EditButton onPress={() => (isEditingName ? handleSave('name') : setIsEditingName(true))}>
              <Icon name={isEditingName ? 'check' : 'edit'} size={20} color="#263A83" />
            </EditButton>
          </InputRow>
        </Row>

        <Row>
          <Label>Nome de utilizador</Label>
          <InputRow>
            <Input
              value={username}
              editable={isEditingUsername}
              onChangeText={setUsername}
              style={isEditingUsername ? { borderBottomWidth: 1, borderBottomColor: '#263A83' } : {}}
            />
            <EditButton onPress={() => (isEditingUsername ? handleSave('username') : setIsEditingUsername(true))}>
              <Icon name={isEditingUsername ? 'check' : 'edit'} size={20} color="#263A83" />
            </EditButton>
          </InputRow>
        </Row>

        <Row>
          <Label>Email</Label>
          <InputRow>
            <Input
              value={email}
              editable={isEditingEmail}
              onChangeText={setEmail}
              style={isEditingEmail ? { borderBottomWidth: 1, borderBottomColor: '#263A83' } : {}}
            />
            <EditButton onPress={() => (isEditingEmail ? handleSave('email') : setIsEditingEmail(true))}>
              <Icon name={isEditingEmail ? 'check' : 'edit'} size={20} color="#263A83" />
            </EditButton>
          </InputRow>
        </Row>

        <HistoryButton onPress={() => Alert.alert('Histórico de torneios', 'A abrir histórico...')}>
          <Icon name="folder" size={20} color="#263A83" />
          <HistoryText>Histórico de torneios</HistoryText>
        </HistoryButton>

        <LogoutButton onPress={() => Alert.alert('Logout', 'Sessão encerrada!')}>
          <LogoutText>Terminar Sessão</LogoutText>
        </LogoutButton>
      </Form>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: #f9f9f9;
  padding: 16px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

const BackButton = styled.TouchableOpacity`
  margin-right: 10px;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #263A83;
`;

const AvatarContainer = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

const Avatar = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
`;

const LevelText = styled.Text`
  margin-top: 8px;
  font-size: 16px;
  color: #263A83;
`;

const Stars = styled.View`
  flex-direction: row;
  margin-top: 4px;
`;

const Form = styled.View`
  flex: 1;
`;

const Row = styled.View`
  margin-bottom: 20px;
`;

const Label = styled.Text`
  font-size: 14px;
  color: #263A83;
  margin-bottom: 4px;
`;

const InputRow = styled.View`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #263A83;
  padding-bottom: 4px;
`;

const Input = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: #333;
`;

const EditButton = styled.TouchableOpacity``;

const HistoryButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-top: 20px;
`;

const HistoryText = styled.Text`
  font-size: 16px;
  color: #263A83;
  margin-left: 8px;
`;

const LogoutButton = styled.TouchableOpacity`
  margin-top: 40px;
  background-color: #263A83;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
`;

const LogoutText = styled.Text`
  font-size: 16px;
  color: #fff;
`;

export default ProfileScreen;
