import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Svg, Circle, Path } from "react-native-svg";

const DetalhesEquipa = () => {
  const { teamId } = useLocalSearchParams();
  const [teamDetails, setTeamDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const imageUrls = [
    "https://celina05.sirv.com/equipas/participante1.png",
    "https://celina05.sirv.com/equipas/participante2.png",
    "https://celina05.sirv.com/equipas/participante3.png",
    "https://celina05.sirv.com/equipas/participante4.png",
    "https://celina05.sirv.com/equipas/participante5.png",
  ];

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * imageUrls.length);
    return imageUrls[randomIndex];
  };

  const openMenu = () => setShowMenu(true);
  const closeMenu = () => setShowMenu(false);

  const handleEditTeam = () => {
    console.log("Editar equipa:", teamId);
    closeMenu();
  };

  const handleDeleteTeam = async () => {
    Alert.alert(
      "Confirmar exclusão",
      "Tens a certeza que queres excluir esta equipa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "equipas", teamId));
              console.log("Equipa excluída com sucesso:", teamId);
              router.back();
            } catch (error) {
              console.error("Erro ao excluir equipa:", error);
            }
          },
        },
      ]
    );
  };

  const handleSettings = () => {
    console.log("Ir para Definições");
    closeMenu();
  };

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const docRef = doc(db, "equipas", teamId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTeamDetails(docSnap.data());
        } else {
          console.error("Documento não encontrado!");
        }

        const participantsRef = doc(
          db,
          "equipas",
          teamId,
          "membros",
          "participantes"
        );
        const participantsSnap = await getDoc(participantsRef);
        if (participantsSnap.exists()) {
          const data = participantsSnap.data();
          const participantsList = Object.values(data).map((name) => ({
            name,
            image: getRandomImage(),
          }));
          setParticipants(participantsList);
        } else {
          console.error("Documento de participantes não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao procurar detalhes da equipa:", error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeamDetails();
    }
  }, [teamId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#263A83" />
      </View>
    );
  }

  if (!teamDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Detalhes da equipa não encontrados.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        accessibilityLabel="Botão voltar atrás"
        style={styles.backButton}
        onPress={() => router.back()}
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

      <View style={styles.info}>
        <Image
          source={require("../../imagens/1.png")}
          style={styles.teamImage}
        />
        <View style={styles.textContainer}>
          <View style={styles.teamRow}>
            <Text style={styles.labelnome}>{teamId}</Text>
            <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
              <Svg width={10} height={6} viewBox="0 0 10 6" fill="none">
                <Path d="M0 0L5 6L10 0" stroke="#263A83" strokeWidth={2} />
              </Svg>
            </TouchableOpacity>
          </View>
          <Text style={styles.labelpontos}>{teamDetails.pontos} pontos</Text>
        </View>
      </View>

      {showMenu && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity style={styles.menuOption} onPress={handleSettings}>
            <Text style={styles.menuOptionText}>Definições</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuOption} onPress={handleEditTeam}>
            <Text style={styles.menuOptionText}>Editar equipa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuOption}
            onPress={handleDeleteTeam}
          >
            <Text style={[styles.menuOptionText, { color: "#D32F2F" }]}>
              Excluir equipa
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.remainingTeamsContainer}>
        {participants.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.peopleImage} />
            <Text style={styles.participantText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 70,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 25,
    zIndex: 999,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#D32F2F",
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 20,
    marginTop: 50,
    zIndex: 998,
    position: "relative",
  },
  teamImage: {
    width: 90,
    height: 90,
    marginLeft: 10,
  },
  textContainer: {
    marginLeft: 15,
    flex: 1,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  labelnome: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263A83",
  },
  labelpontos: {
    fontSize: 14,
    color: "#263A83",
    marginTop: 3,
  },
  menuButton: {
    paddingHorizontal: 5,
  },
  menuDropdown: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000,
  },
  menuOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  menuOptionText: {
    fontSize: 16,
    color: "#263A83",
  },
  remainingTeamsContainer: {
    backgroundColor: "#D2E9FF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    width: 370,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  peopleImage: {
    width: 60,
    height: 60,
  },
  card: {
    flexDirection: "row",
    padding: 15,
    width: 330,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    height: 75,
  },
  participantText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#263A83",
    fontWeight: "500",
  },
});

export default DetalhesEquipa;
