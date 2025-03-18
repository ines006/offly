import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Svg, Circle, Path } from "react-native-svg";


const DetalhesEquipa = () => {
  const { teamId } = useLocalSearchParams();
  const [teamDetails, setTeamDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handlePress = () => {
    router.push("../caderneta/caderneta"); 
  };
  const handlePressDesafio = () => {
  
    router.push("../desafio/verificarDesafio");
  };

  // Array de URLs das imagens p/ users
  const imageUrls = [
    "https://celina05.sirv.com/equipas/participante1.png",
    "https://celina05.sirv.com/equipas/participante2.png",
    "https://celina05.sirv.com/equipas/participante3.png",
    "https://celina05.sirv.com/equipas/participante4.png",
    "https://celina05.sirv.com/equipas/participante5.png",
  ];

  // Função para obter uma URL aleatória
  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * imageUrls.length);
    return imageUrls[randomIndex];
  };

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        // Aqui busca os dados principais da equipa
        const docRef = doc(db, "equipas", teamId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTeamDetails(docSnap.data());
        } else {
          console.error("Documento não encontrado!");
        }

        // Aqui busca os participantes na subcoleção 'membros/participantes' 
        const participantsRef = doc(
          db,
          "equipas",
          teamId,
          "membros",
          "participantes"
        );
        const participantsSnap = await getDoc(participantsRef);

        if (participantsSnap.exists()) {
          // Extrair os valores dos campos
          const participantsData = Object.values(participantsSnap.data());
          setParticipants(participantsData);
        } else {
          console.error("Documento de participantes não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes da equipa:", error);
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
      
      <TouchableOpacity accessible={true} accessibilityLabel="Botão voltar atrás" style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>
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
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>Torneio XPTO</Text>

<<<<<<< HEAD
      <TouchableOpacity
        style={styles.info}
        accessible={true}
        accessibilityLabel={`Equipa ${teamId}, ${teamDetails.pontos} pontos`}
        accessibilityRole="button"
        activeOpacity={1} 
      >
=======
      <View accessible={true} style={styles.info}>
>>>>>>> acessibilidade-ines
        <Image
          accessibilityLabel="Imagem de equipa"
          source={require("../../imagens/1.png")}
          style={styles.teamImage}
          accessibilityLabel={`Imagem da equipa ${teamId}`}
        />

        <View style={styles.textContainer}>
          <Text style={styles.labelnome}>{teamId}</Text>
          <Text style={styles.labelpontos}>{teamDetails.pontos} pontos</Text>
        </View>
      </TouchableOpacity>



      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handlePress}>

                      <Svg width="99" height="99" viewBox="0 0 55 55" fill="none">
                        {" "}
                        <Path
                          d="M25.2654 20.8129L25.2683 55.0055L9.66159 55.0074C4.50969 55.0074 0.299525 50.9754 0.0152943 45.8946L0 45.3463V20.8129H25.2654ZM29.7245 38.6494H54.9958L54.9982 45.3463C54.9976 50.6818 50.6722 55.0074 45.3365 55.0074L29.7275 55.0055L29.7245 38.6494ZM45.3384 0.000732422C50.4903 0.000732422 54.7005 4.03281 54.9847 9.11368L55 9.66193L54.9958 34.1903H29.7245L29.7275 0.000732422H45.3384ZM25.2683 0.000732422L25.2654 16.3538H0L0.00178536 9.66198C0.00240643 4.32641 4.32778 0.000732422 9.66335 0.000732422H25.2683Z"
                          fill="white"
                        />{" "}
                      </Svg>

          <Text style={styles.buttonText}>Ver Caderneta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePressDesafio}>

          <Svg width="100" height="100" viewBox="0 0 63 63" fill="none">
                        {" "}
                        <Path
                          d="M55.1147 15.7471V29.1951C52.7034 28.1416 50.0406 27.5574 47.2411 27.5574C36.3702 27.5574 27.5573 36.3702 27.5573 47.2412C27.5573 50.0406 28.1416 52.7034 29.195 55.1147H9.84191C4.40638 55.1147 0 50.7083 0 45.2728V15.7471H55.1147Z"
                          fill="white"
                        />{" "}
                        <Path
                          d="M45.2728 0C50.7083 0 55.1147 4.40638 55.1147 9.8419V11.8103H0V9.8419C0 4.40638 4.40638 0 9.84191 0H45.2728Z"
                          fill="white"
                        />{" "}
                        <Path
                          d="M47.2471 35.4308C40.7211 35.4308 35.4309 40.7211 35.4309 47.247C35.4309 53.773 40.7211 59.0632 47.2471 59.0632C49.0576 59.0632 50.7512 58.6499 52.2987 57.9117C53.2798 57.4436 54.4549 57.8594 54.923 58.8408C55.3911 59.8218 54.975 60.9966 53.9939 61.4646C51.9436 62.4429 49.6729 63 47.2471 63C38.5468 63 31.4941 55.9473 31.4941 47.247C31.4941 38.5468 38.5468 31.4941 47.2471 31.4941C55.9422 31.4941 62.9918 38.5385 63 47.2313V47.2411V49.2016C63 52.466 60.3537 55.1127 57.089 55.1127C55.2832 55.1127 53.6664 54.3029 52.5822 53.0262C51.1783 54.3226 49.3025 55.1146 47.2412 55.1146C42.8926 55.1146 39.3677 51.5897 39.3677 47.2411C39.3677 42.8926 42.8926 39.3676 47.2412 39.3676C48.9572 39.3676 50.5453 39.9168 51.8389 40.8486C52.1865 40.5396 52.6444 40.3518 53.1463 40.3518C54.2333 40.3518 55.1147 41.2332 55.1147 42.3202V49.2016C55.1147 50.2921 55.9985 51.1759 57.089 51.1759C58.1795 51.1759 59.0633 50.2921 59.0633 49.2016V47.247C59.0633 40.7211 53.7731 35.4308 47.2471 35.4308ZM43.3044 47.2411C43.3044 49.4154 45.0669 51.1779 47.2412 51.1779C49.4155 51.1779 51.1779 49.4154 51.1779 47.2411C51.1779 45.0669 49.4155 43.3044 47.2412 43.3044C45.0669 43.3044 43.3044 45.0669 43.3044 47.2411Z"
                          fill="white"
                        />{" "}
                      </Svg>
          <Text style={styles.buttonText}>Ver Desafio Semanal</Text>
        </TouchableOpacity>
      </View>

<<<<<<< HEAD
      <View style={styles.remainingTeamsContainer}>
        <FlatList
          data={participants}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.card}
              accessible={true}
              accessibilityLabel={`Participante ${index + 1}: ${item}`}
              accessibilityRole="button"
            >
=======
      <View accessible={true} style={styles.remainingTeamsContainer}>
        {participants.length > 0 ? (
          participants.map((participant, index) => (
            <View key={index} style={styles.card}>
>>>>>>> acessibilidade-ines
              <Image
                accessibilityLabel="Imagem do participante"
                source={{ uri: getRandomImage() }}
                style={styles.peopleImage}
                accessible={true}
                accessibilityLabel={`Foto do participante ${index + 1}, ${item}`}
              />
              <Text
                style={styles.participantText}
                accessible={true}
                accessibilityRole="text"
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          accessibilityRole="list"
          accessibilityLabel="Lista de participantes da equipe"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 40,
    width: 40,
    height: 40,
    left: 25,
    borderRadius: 25,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
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
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Regular",
    fontWeight: "bold",
    color: "#263A83",
    textAlign: "center",
    marginTop: 27,
    marginBottom: 30,
  },
  labelnome: {
    fontSize: 19,
    color: "#333",
    marginBottom: 10,
    color: "#263A83",
    fontFamily: "Poppins-Regular",
  },
  labelpontos: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    color: "#263A83",
    fontFamily: "Poppins-Regular",
  },
  labelTitle: {
    fontWeight: "bold",
    color: "#263A83",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#263A83",
    padding: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    marginTop:16,
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Poppins-Regular",
  },
  participantsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: 10,
  },
  participantItem: {
    backgroundColor: "#E3E3E3",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  participantText: {
    fontSize: 16,
    color: "#263A83",
    marginLeft: 10,
    fontWeight: "bold",
  },
  noParticipants: {
    fontSize: 16,
    color: "#999",
  },
  card: {
    flexDirection: "row",
    padding: 15,
    width: 330,
    marginVertical: 8,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    height: 75,
  },
  remainingTeamsContainer: {
    flex: 1,
    backgroundColor: "#D2E9FF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 15,
    paddingBottom: 15,
    width: 370,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  teamImage: {
    width: 90,
    height: 90,
    marginLeft: 10,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  textContainer: {
    flexDirection: "column",
    marginLeft: 10,
    marginTop: 10,
  },
  peopleImage: {
    width: 60,
    height: 60,
  },

  Text:{
color:"red",
  }
});

export default DetalhesEquipa;
