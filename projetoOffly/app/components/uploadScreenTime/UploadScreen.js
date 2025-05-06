import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Svg, { Circle, Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { doc, getDoc, getDocs, setDoc, updateDoc, collection } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseApi";

const UploadScreen = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null); //var de estado que guarda o id do user logado
  const [submitVisible, setSubmitVisible] = useState(false); // var de estado que define a visibilidade do botão "Submeter"
  const [modalVisible, setModalVisible] = useState(false); // var de estado que define a visibilidade do modal de sucesso
  const [selectedImage, setSelectedImage] = useState(null); // var de estado que guarda a imagem selecionada

// Verificação de utilizador logado
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    } else {
      Alert.alert("Erro", "Nenhum utilizador logado!");
    }
  }, []);


  // Função para abrir a modal e submeter dados de upload para a firebase
  const handleSubmit = async () => {
    setSubmitVisible(false);
    setModalVisible(true);

    try { // Função para verificar e atualizar o Firestore
    
      if (userId) {
      const userDocRef = doc(db, "users", userId); 

      const currentTime = Date.now(); // Timestamp UNIX
      const today = new Date().toISOString().split("T")[0]; // Data no formato YYYY-MM-DD

      // Verifica se o documento existe
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        // Se o documento existir, atualiza os campos
        await updateDoc(userDocRef, {
          upload: true,
          data: today,
        });
        console.log("Campos atualizados no Firestore.");
      } else {
        // Se o documento não existir, cria o documento com os campos
        await setDoc(userDocRef, {
          upload: true,
          data: today,
        });
        console.log("Documento criado no Firestore.");
      }

      // Atualizar desafios semanais
      await updateWeeklyChallenge();

    }
    } catch (error) {
      console.error("Erro ao registar upload:", error);
    }
  };

  const updateWeeklyChallenge = async () => {
    try {
      // Obter a equipa do utilizador
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.error("Utilizador não encontrado.");
        return;
      }

      const userName = userDocSnap.data()?.fullName;
      if (!userName) {
        console.error("Utilizador não tem nome.");
        return;
      }

      const teamName = userDocSnap.data()?.team;
      if (!teamName) {
        console.error("Utilizador não pertence a nenhuma equipa.");
        return;
      }

      // Aceder a carta não validada atual
      const cartasSnapshot = await getDocs(collection(db, "desafioSemanal"));
      const cartas = cartasSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.id.localeCompare(b.id));

      const currentCarta = cartas.find((carta) => !carta.validada);
      if (!currentCarta) {
        console.error("Nenhuma carta não validada encontrada.");
        return;
      }

      // Obter o timer da carta atual
      const timerDocRef = doc(db, "desafioSemanal", currentCarta.id, "timer", "timerCarta");
      const timerDocSnap = await getDoc(timerDocRef);

      if (!timerDocSnap.exists()) {
        console.error("Timer não encontrado.");
        return;
      }

      const timerData = timerDocSnap.data();
      const startDate = new Date(timerData.start);
      const endDate = new Date(timerData.end);
      const now = new Date();

      if (now < startDate || now > endDate) {
        console.error("Fora do intervalo do desafio semanal.");
        return;
      }

      const diffInDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Atualizar o campo do dia correspondente no documento do participante
      const participantDocRef = doc(
        db,
        "desafioSemanal",
        currentCarta.id,
        "equipasDesafio",
        teamName,
        "participante1",
        userName
      );

      const participantDocSnap = await getDoc(participantDocRef);
      if (participantDocSnap.exists()) {
        const updateData = {};
        updateData[diffInDays] = true;

        await updateDoc(participantDocRef, updateData);
        console.log(`Dia ${diffInDays} atualizado para true.`);
      } else {
        console.error("Documento do participante não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao atualizar desafios semanais:", error);
    }
  };

  // Função para abrir a galeria e selecionar uma imagem
  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Erro", "Permissão para acessar a galeria negada!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setSubmitVisible(true);
    }
  };

  // Função para abrir o botão de submeter
  const handleButton = () => {
    setSubmitVisible(true);
  };

  // Função para remover a imagem
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSubmitVisible(false);
  };

  // Função para fechar a modal
  const handleCloseModal = () => {
    setModalVisible(false);
    router.push("../../components/navbar");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      {/* Botão de Voltar atrás */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Botão voltar atrás">
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
        {/* Título */}
        <Text style={styles.title}>Upload do tempo de ecrã</Text>
      </View>

      <View style={styles.dashedBox}>
        {/* Mostra a imagem selecionada ou o ícone de upload */}
        {selectedImage ? (
          <Image accessibilityLabel="Imagem selecionada" source={{ uri: selectedImage }} style={styles.imagePreview} />
        ) : (
          <>
          <TouchableOpacity onPress={handleSelectImage} accessibilityLabel="Faz upload do print do tempo de ecrã.">
            <Svg width={49} height={49} viewBox="0 0 49 49" fill="none">
            <Path
              d="M0.125 8.25C0.125 3.7627 3.7627 0.125 8.25 0.125H40.75C45.2374 0.125 48.875 3.7627 48.875 8.25V24.559C47.2351 23.509 45.4094 22.7236 43.4583 22.2626V8.25C43.4583 6.75424 42.2458 5.54167 40.75 5.54167H8.25C6.75424 5.54167 5.54167 6.75424 5.54167 8.25V40.75C5.54167 42.2458 6.75424 43.4583 8.25 43.4583H22.2626C22.7236 45.4094 23.509 47.2351 24.559 48.875H8.25C3.7627 48.875 0.125 45.2374 0.125 40.75V8.25Z"
              fill="#263A83"
            />
          </Svg>
          <Svg
            width={31}
            height={31}
            viewBox="0 0 31 31"
            fill="none"
            style={styles.plusIcon}
          >
            <Path
              d="M30.2917 15.3958C30.2917 7.169 23.6227 0.5 15.3958 0.5C7.169 0.5 0.5 7.169 0.5 15.3958C0.5 23.6227 7.169 30.2917 15.3958 30.2917C23.6227 30.2917 30.2917 23.6227 30.2917 15.3958ZM16.7516 16.75L16.753 23.5303C16.753 24.2784 16.1469 24.8845 15.3988 24.8845C14.651 24.8845 14.0446 24.2784 14.0446 23.5303L14.0433 16.75H7.26027C6.5125 16.75 5.9061 16.1439 5.9061 15.3958C5.9061 14.6481 6.5125 14.0417 7.26027 14.0417H14.043L14.0417 7.26894C14.0417 6.5209 14.6481 5.91477 15.3958 5.91477C16.1436 5.91477 16.75 6.5209 16.75 7.26894L16.7514 14.0417H23.529C24.277 14.0417 24.8831 14.6481 24.8831 15.3958C24.8831 16.1439 24.277 16.75 23.529 16.75H16.7516Z"
              fill="#263A83"
            />
          </Svg>
          </TouchableOpacity>
          <Text style={styles.description}>Faz upload do print do tempo de ecrã</Text>
          </>
        )}
        
        {/* Botão "Remover" */}
        {selectedImage && (
          <TouchableOpacity style={styles.removeButton} onPress={handleRemoveImage}>
            <Text style={styles.removeText}>Remover</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Botão "Submeter" */}
      {submitVisible && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submeter</Text>
        </TouchableOpacity>
      )}

      {/* Modal de sucesso */}
      <Modal
        visible={modalVisible}
        animationType="none" 
        transparent={true}
        onRequestClose={handleCloseModal}
        >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
            {/* Círculo com o ícone no topo */}
            <View style={styles.circleWrapper}>
            <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
            <Circle cx="40" cy="40" r="40" fill="#BFE0FF" />
            <Path
                d="M33.6 51.2L24 41.6C23.1 40.7 23.1 39.1 24 38.2C24.9 37.3 26.5 37.3 27.4 38.2L34.8 45.6L52.6 27.8C53.5 26.9 55.1 26.9 56 27.8C56.9 28.7 56.9 30.3 56 31.2L36 51.2C35.1 52.1 33.9 52.1 33.6 51.2Z"
                fill="#263A83"
            />
            </Svg>
            </View>

            {/* Conteúdo da modal */}
            <Text style={styles.modalTitle}>Print do tempo de ecrã submetido com sucesso</Text>
            <Text style={styles.modalMessage}>
                Poderás perder um máximo de 25 pontos.
            </Text>
            <Text style={styles.modalMessage2}>
                Amanhã será possível realizar outra submissão!
            </Text>
            <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCloseModal}
                
            >
                <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 35,
  },
  backButton: {
    position: "absolute",
    left: 25,
  },
  title: {
    width: 172,
    color: "#263A83",
    textAlign: "center",
    fontFamily: "Poppins",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 25,
  },
  dashedBox: {
    width: 286,
    height: 386,
    borderRadius: 20,
    borderWidth: 2.5,
    borderStyle: "dashed",
    borderColor: "#263A83",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  imagePreview: { 
    width: 200, 
    height: 200, 
    resizeMode: "contain" 
  },
  iconWrapper: {
    position: "relative",
    width: 49,
    height: 49,
    justifyContent: "center",
    alignItems: "center",
  },
  plusIcon: {
    position: "absolute",
    right: -5,
    bottom: -5,
  },
  description: {
    width: 150,
    color: "#263A83",
    textAlign: "center",
    fontFamily: "Poppins",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 16,
    marginTop: 20,
  },
  submitButton: {
    display: "flex",
    paddingVertical: 10,
    paddingHorizontal: 47,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    backgroundColor: "#263A83",
    marginTop: 30,
  },
  submitText: {
    color: "#FFF",
    textAlign: "justify",
    fontFamily: "Poppins",
    fontSize: 15,
    fontWeight: "600",
  },
  circleWrapper: {
    position: "absolute",
    top: -30, 
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 30,
    width: 60,
    height: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    paddingTop: 50, 
    position: "relative",
  },
  removeButton: { 
    marginTop: 10, 
    padding: 10 
  },
  removeText: { 
    color: "#FF3B30", 
    fontSize: 15 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 300,
    height: 395,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#263A83",
    marginTop: 30,
    marginBottom: 30,
    textAlign: "center",
  },
  modalMessage: {
    width: 180,
    fontSize: 14,
    color: "#263A83",
    textAlign: "center",
    marginBottom: 20,
  },
  modalMessage2: {
    width: 180,
    fontSize: 14,
    color: "#263A83",
    textAlign: "center",
    marginBottom: 80,
  },
  modalButton: {
    backgroundColor: "#263A83",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 47,
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default UploadScreen;