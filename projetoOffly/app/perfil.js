import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Alert } from 'react-native';
import { auth, db } from './firebase/firebaseApi';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useRouter } from "expo-router";

const ProfileScreen = () => {
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // var de estado que guarda a imagem do utilizador
  
  const router = useRouter();

  // Array de URLs das imagens p/ users
const imageUserUrls = [
  "https://celina05.sirv.com/equipas/participante1.png",
  "https://celina05.sirv.com/equipas/participante2.png",
  "https://celina05.sirv.com/equipas/participante3.png",
  "https://celina05.sirv.com/equipas/participante4.png",
  "https://celina05.sirv.com/equipas/participante5.png",
];

// Função para obter uma URL aleatória 
const getRandomImage = (tipo) => {
  const randomIndex = Math.floor(Math.random() * tipo.length);
  return tipo[randomIndex];
};

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    } else {
      Alert.alert('Erro', 'Usuário não autenticado.');
    }
  }, []);

  
  useEffect(() => {
    const loadUserData = async () => {
      if (userId) {
        try {
          const userDocRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const { fullName, username, image } = userDoc.data();
            setName(fullName || '');
            setUsername(username || '');

          if (image) {
            // Atribuir a imagem existente ao estado
            setProfileImage({ uri: image });
          } else {
            // Gerar e atribuir uma nova imagem aleatória
            const newProfileImage = getRandomImage(imageUserUrls);
            setProfileImage({ uri: newProfileImage });
                        
            // Atualizar o documento do utilizador com a nova imagem
            await updateDoc(userDocRef, { image: newProfileImage });
          }

          } else {
            Alert.alert('Erro', 'Usuário não encontrado no Firestore.');
          }
        } catch (error) {
          console.error('Erro ao carregar os dados do usuário:', error);
          Alert.alert('Erro', 'Falha ao carregar dados do Firestore.');
        }
      }
    };

    loadUserData();
  }, [userId]);

  
  const reauthenticateUser = async (currentPassword) => {
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);

      
      await reauthenticateWithCredential(user, credential);
      console.log('Reautenticação bem-sucedida!');
    } catch (error) {
      console.error('Erro ao reautenticar o usuário:', error);
      Alert.alert('Erro', 'Senha atual incorreta.');
      throw error;
    }
  };

  
  const handleSave = async (field) => {
    if (!userId) return;

    try {
      const userDocRef = doc(db, 'users', userId);

      if (field === 'password') {
        
        Alert.prompt(
          'Alteração de Senha',
          'Digita a tua senha atual:',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: async (currentPassword) => {
                Alert.prompt(
                  'Nova Senha',
                  'Digite a nova senha:',
                  [
                    {
                      text: 'Cancelar',
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: async (newPassword) => {
                        try {
                          // Reautenticar o usuário
                          await reauthenticateUser(currentPassword);

                          // Atualizar a senha no Firebase Authentication
                          await updatePassword(auth.currentUser, newPassword);
                          Alert.alert('Sucesso', 'Senha alterada com sucesso!');
                        } catch (error) {
                          console.error('Erro ao alterar a senha:', error);

                          if (error.code === 'auth/weak-password') {
                            Alert.alert('Erro', 'A senha precisa ter pelo menos 6 caracteres.');
                          } else if (error.code === 'auth/wrong-password') {
                            Alert.alert('Erro', 'A senha atual está incorreta.');
                          } else {
                            Alert.alert('Erro', 'Não foi possível alterar a senha. Tente novamente.');
                          }
                        }
                      },
                    },
                  ],
                  'secure-text'
                );
              },
            },
          ],
          'secure-text'
        );
      } else {
       
        const updatedData = {};

        if (field === 'name') {
          updatedData.fullName = name || '';
          setIsEditingName(false);
        } else if (field === 'username') {
          updatedData.username = username || '';
          setIsEditingUsername(false);
        }

        await updateDoc(userDocRef, updatedData);
        Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar os dados:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut(); 
      router.replace('./components/entrar/login'); 
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
      Alert.alert('Erro', 'Não foi possível terminar a sessão.');
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#263A83" />
        </BackButton>
        <HeaderTitle>Perfil</HeaderTitle>
      </Header>

      <AvatarContainer>
        <Avatar source={profileImage} />
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
          <Label>Nome de Utilizador</Label>
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
          <Label>Alterar Password</Label>
          <InputRow>
            <EditButton onPress={() => handleSave('password')}>
              <Icon name="edit" size={20} color="#263A83" /> 
            </EditButton>
          </InputRow>
        </Row>

        <LogoutButton onPress={handleLogout}>
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
