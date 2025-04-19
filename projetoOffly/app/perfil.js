import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Alert, TouchableOpacity, StyleSheet} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { auth, db } from "./firebase/firebaseApi";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useRouter } from "expo-router";

const Perfil = () => {
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // Variável de estado que guarda a imagem do utilizador
  const router = useRouter();

  // URLs de imagens aleatórias para perfil
  const imageUserUrls = [
    "https://celina05.sirv.com/avatares/avatar4.png",
    "https://celina05.sirv.com/avatares/avatar5.png",
    "https://celina05.sirv.com/avatares/avatar6.png",
    "https://celina05.sirv.com/avatares/avatar9.png",
    "https://celina05.sirv.com/avatares/avatar10.png",
    "https://celina05.sirv.com/avatares/avatar11.png",
    "https://celina05.sirv.com/avatares/avatar12.png",
    "https://celina05.sirv.com/avatares/avatar13.png",
    "https://celina05.sirv.com/avatares/avatar16.png",
    "https://celina05.sirv.com/avatares/avatar18.png",
    "https://celina05.sirv.com/avatares/avatar20.png",
    "https://celina05.sirv.com/avatares/avatar1.png",
    "https://celina05.sirv.com/avatares/avatar2.png",
    "https://celina05.sirv.com/avatares/avatar3.png",
    "https://celina05.sirv.com/avatares/avatar7.png",
    "https://celina05.sirv.com/avatares/avatar8.png",
    "https://celina05.sirv.com/avatares/avatar14.png",
    "https://celina05.sirv.com/avatares/avatar15.png",
    "https://celina05.sirv.com/avatares/avatar17.png",
    "https://celina05.sirv.com/avatares/avatar19.png",
  ];

  // Função para obter uma URL aleatória
  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * imageUserUrls.length);
    return imageUserUrls[randomIndex];
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    } else {
      Alert.alert("Erro", "Usuário não autenticado.");
    }
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (userId) {
        try {
          const userDocRef = doc(db, "users", userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const { fullName, username, image } = userDoc.data();
            setName(fullName || "");
            setUsername(username || "");
            if (image) {
              // Atribuir a imagem existente ao estado
              setProfileImage({ uri: image });
            } else {
              // Gerar e atribuir uma nova imagem aleatória
              const newProfileImage = getRandomImage();
              setProfileImage({ uri: newProfileImage });
              // Atualizar o documento do utilizador com a nova imagem
              await updateDoc(userDocRef, { image: newProfileImage });
            }
          } else {
            Alert.alert("Erro", "Usuário não encontrado no Firestore.");
          }
        } catch (error) {
          console.error("Erro ao carregar os dados do usuário:", error);
          Alert.alert("Erro", "Falha ao carregar dados do Firestore.");
        }
      }
    };
    loadUserData();
  }, [userId]);

  const reauthenticateUser = async (currentPassword) => {
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      console.log("Reautenticação bem-sucedida!");
    } catch (error) {
      console.error("Erro ao reautenticar o usuário:", error);
      Alert.alert("Erro", "Senha atual incorreta.");
      throw error;
    }
  };

  const handleSave = async (field) => {
    if (!userId) return;
    try {
      const userDocRef = doc(db, "users", userId);
      if (field === "password") {
        Alert.prompt(
          "Alteração de Senha",
          "Digite a sua senha atual:",
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "OK",
              onPress: async (currentPassword) => {
                Alert.prompt(
                  "Nova Senha",
                  "Digite a nova senha:",
                  [
                    {
                      text: "Cancelar",
                      style: "cancel",
                    },
                    {
                      text: "OK",
                      onPress: async (newPassword) => {
                        try {
                          // Reautenticar o usuário
                          await reauthenticateUser(currentPassword);
                          // Atualizar a senha no Firebase Authentication
                          await updatePassword(auth.currentUser, newPassword);
                          Alert.alert("Sucesso", "Senha alterada com sucesso!");
                        } catch (error) {
                          console.error("Erro ao alterar a senha:", error);
                          if (error.code === "auth/weak-password") {
                            Alert.alert(
                              "Erro",
                              "A senha precisa ter pelo menos 6 caracteres."
                            );
                          } else if (error.code === "auth/wrong-password") {
                            Alert.alert(
                              "Erro",
                              "A senha atual está incorreta."
                            );
                          } else {
                            Alert.alert(
                              "Erro",
                              "Não foi possível alterar a senha. Tente novamente."
                            );
                          }
                        }
                      },
                    },
                  ],
                  "secure-text"
                );
              },
            },
          ],
          "secure-text"
        );
      } else {
        const updatedData = {};
        if (field === "name") {
          updatedData.fullName = name || "";
          setIsEditingName(false);
        } else if (field === "username") {
          updatedData.username = username || "";
          setIsEditingUsername(false);
        }
        await updateDoc(userDocRef, updatedData);
        Alert.alert("Sucesso", "Alterações salvas com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar os dados:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace("./components/entrar/login");
    } catch (error) {
      console.error("Erro ao terminar sessão:", error);
      Alert.alert("Erro", "Não foi possível terminar a sessão.");
    }
  };

  return (
    <Container>
      <Header>
        {/* Botão Voltar atualizado */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("../../components/navbar")}
      >
        <Svg width={36} height={35} viewBox="0 0 36 35" fill="none">
          <Circle
            cx="18.1351"
            cy="17.1713"
            r="16.0177"
            stroke="#263A83"
            strokeWidth={2}
          />
          <Path
            d="M21.4043 9.06396L13.1994 16.2432C12.7441 16.6416 12.7441 17.3499 13.1994 17.7483L21.4043 24.9275"
            stroke="#263A83"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      </TouchableOpacity>
        <HeaderTitle>Perfil</HeaderTitle>
      </Header>
      <AvatarContainer>
        <Avatar
          accessibilityLabel="Imagem de perfil do utilizador"
          source={profileImage}
        />
        <LevelText>Nível 1</LevelText>
        <Stars>
          <Icon
            accessibilityLabel="estrela nível 1"
            name="star"
            size={20}
            color="#263A83"
          />
          <Icon
            accessibilityLabel="estrela nível 2"
            name="star"
            size={20}
            color="#ccc"
          />
          <Icon
            accessibilityLabel="estrela nível 3"
            name="star"
            size={20}
            color="#ccc"
          />
          <Icon
            accessibilityLabel="estrela nível 4"
            name="star"
            size={20}
            color="#ccc"
          />
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
              style={
                isEditingName
                  ? { borderBottomWidth: 1, borderBottomColor: "#263A83" }
                  : {}
              }
            />
            <EditButton
              onPress={() =>
                isEditingName ? handleSave("name") : setIsEditingName(true)
              }
            >
              <Icon
                name={isEditingName ? "check" : "edit"}
                size={20}
                color="#263A83"
              />
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
              style={
                isEditingUsername
                  ? { borderBottomWidth: 1, borderBottomColor: "#263A83" }
                  : {}
              }
            />
            <EditButton
              onPress={() =>
                isEditingUsername
                  ? handleSave("username")
                  : setIsEditingUsername(true)
              }
            >
              <Icon
                name={isEditingUsername ? "check" : "edit"}
                size={20}
                color="#263A83"
              />
            </EditButton>
          </InputRow>
        </Row>
        <Row>
          <Label>Alterar Password</Label>
          <InputRow>
            <EditButton onPress={() => handleSave("password")}>
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

// Estilização
const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 65,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderColor: "#263A83",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
})

const Container = styled.View`
  flex: 1;
  background-color: #f9f9f9;
  padding: 16px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 50px;

`;

const BackButton = styled(TouchableOpacity)`
  position: absolute;
  top: 40px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: transparent;
  border: 2px solid #263a83;
  justify-content: center;
  align-items: center;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #263a83;
`;

const AvatarContainer = styled.View.attrs({
  accessible: true,
})`
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
  color: #263a83;
`;

const Stars = styled.View.attrs({
  accessible: true,
})`
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
  color: #263a83;
  margin-bottom: 4px;
`;

const InputRow = styled.View`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #263a83;
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
  background-color: #263a83;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
`;

const LogoutText = styled.Text`
  font-size: 16px;
  color: #fff;
`;

export default Perfil;
