import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Svg, { Circle, Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseApi";

const UploadScreen = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [submitVisible, setSubmitVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    } else {
      Alert.alert("Erro", "Nenhum utilizador logado!");
    }
  }, []);

  const handleSubmit = async () => {
    setSubmitVisible(false);
    setModalVisible(true);

    try {
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        const today = new Date().toISOString().split("T")[0];

        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          await updateDoc(userDocRef, { upload: true, data: today });
        } else {
          await setDoc(userDocRef, { upload: true, data: today });
        }
      }
    } catch (error) {
      console.error("Erro ao registar upload:", error);
    }
  };

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

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSubmitVisible(false);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    router.push("../pag-principal-lg/pag-principal-lg");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Svg width={36} height={35} viewBox="0 0 36 35" fill="none">
            <Circle cx="18.1351" cy="17.1713" r="16.0177" stroke="#263A83" strokeWidth={2} />
            <Path
              d="M21.4043 9.06396L13.1994 16.2432C12.7441 16.6416 12.7441 17.3499 13.1994 17.7483L21.4043 24.9275"
              stroke="#263A83"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>

        <Text style={styles.title}>Upload do tempo de ecrã</Text>
      </View>


      {/* ADICIONAR ICON AQUI */}


      <View style={styles.dashedBox}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        ) : (
          <TouchableOpacity onPress={handleSelectImage}>
            <Text style={styles.description}>Faz upload do print do tempo de ecrã</Text>
          </TouchableOpacity>
        )}

        {selectedImage && (
          <TouchableOpacity style={styles.removeButton} onPress={handleRemoveImage}>
            <Text style={styles.removeText}>Remover</Text>
          </TouchableOpacity>
        )}
      </View>

      {submitVisible && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submeter</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Upload submetido com sucesso!</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleCloseModal}>
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
    zIndex: 10, 
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
