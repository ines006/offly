import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi";
import { useRouter } from "expo-router";

const PodioPontuacao = () => {
  const [teams, setTeams] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTorneioEquipas = async () => {
      try {
        const torneioRef = doc(db, "torneios", "Torneio XPTO");
        const torneioSnap = await getDoc(torneioRef);

        if (torneioSnap.exists()) {
          const torneioData = torneioSnap.data();
          const equipasIds = torneioData.equipas || [];

          const equipasPromises = equipasIds.map(async (id) => {
            const equipaRef = doc(db, "equipas", id);
            const equipaSnap = await getDoc(equipaRef);
            return {
              id,
              name: equipaSnap.data()?.nome || "Desconhecido",
              points: equipaSnap.data()?.pontos || 0,
              acquired: equipaSnap.data()?.adquiridos || 0,
              totalPoints:
                (equipaSnap.data()?.pontos || 0) +
                (equipaSnap.data()?.adquiridos || 0), // Soma de pontos e adquiridos
              imageUrl:
                equipaSnap.data()?.imagem || "https://default-image-url.png",
            };
          });

          const equipasData = await Promise.all(equipasPromises);
          setTeams(equipasData.sort((a, b) => b.totalPoints - a.totalPoints)); // Classifica pela soma
        }
      } catch (error) {
        console.error("Erro ao buscar equipas do torneio:", error);
      }
    };

    fetchTorneioEquipas();
  }, []);

  const Podium = () => (
    <View style={styles.podiumContainer}>
      {/* 2nd Place */}
      <View accessible={true} style={[styles.podiumSection, styles.secondPlaceSection]}>
        <Image
          accessibilityLabel="Imagem da equipa em segundo lugar"
          source={{
            uri: teams[1]?.imageUrl || "https://default-image-url.png",
          }}
          style={styles.teamImage}
        />
        <Text style={styles.podiumTeam}>{teams[1]?.name || "-"}</Text>
        <Text style={styles.podiumPoints}>{teams[1]?.totalPoints || "-"} P</Text>
      </View>

      {/* 1st Place */}
      <View accessible={true} style={[styles.podiumSection, styles.firstPlaceSection]}>
        <Image
          accessibilityLabel="Imagem da equipa em primeiro lugar"
          source={{
            uri: teams[0]?.imageUrl || "https://default-image-url.png",
          }}
          style={styles.teamImage}
        />
        <Text style={styles.podiumTeam}>{teams[0]?.name || "-"}</Text>
        <Text style={styles.podiumPoints}>{teams[0]?.totalPoints || "-"} P</Text>
      </View>

      {/* 3rd Place */}
      <View accessible={true} style={[styles.podiumSection, styles.thirdPlaceSection]}>
        <Image
          accessibilityLabel="Imagem da equipa em terceiro lugar"
          source={{
            uri: teams[2]?.imageUrl || "https://default-image-url.png",
          }}
          style={styles.teamImage}
        />
        <Text style={styles.podiumTeam}>{teams[2]?.name || "-"}</Text>
        <Text style={styles.podiumPoints}>{teams[2]?.totalPoints || "-"} P</Text>
      </View>
    </View>
  );

  const RemainingTeams = () => (
    <FlatList
      data={teams.slice(3)}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "../leaderboard/detalhesEquipa", // Alterar o caminho para editar componente individualmente
              params: { teamId: item.id },
            })
          }
        >
          <View style={styles.rankCircle}>
            <Text style={styles.rankText}>{index + 4}</Text>
          </View>

          <Image
            accessibilityLabel="Imagem da equipa"
            source={{ uri: item.imageUrl || "https://default-image-url.png" }}
            style={styles.teamIcon}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.points}>{item.totalPoints} pontos</Text>
          </View>

          <Text
            style={[
              styles.acquired,
              { color: item.acquired >= 0 ? "#1D9A6C" : "#D32F2F" },
            ]}
          >
            {item.acquired >= 0 ? `+${item.acquired}` : item.acquired}{" "}
            {item.acquired >= 0 ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Torneio XPTO</Text>
      <Podium />

      <ImageBackground
        accessible={true}
        accessibilityLabel="Ilustração do pódio com segundo, primeiro e terceiro lugar"
        source={require("../../imagens/podioImagem.png")}
        style={styles.podiumBackground}
        imageStyle={styles.podiumImage}
      />

      <View style={styles.remainingTeamsContainer}>
        <RemainingTeams />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#263A83",
    textAlign: "center",
    marginVertical: 20,
    marginTop: 100,
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: -120,
  },
  podiumBackground: {
    height: 400,
    margin: 10,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  podiumImage: {
    resizeMode: "contain",
  },
  podiumSection: {
    alignItems: "center",
    marginHorizontal: 20,
  },
  firstPlaceSection: {
    marginBottom: 25,
    padding: 10,
  },
  secondPlaceSection: {
    marginBottom: -40,
  },
  thirdPlaceSection: {
    marginBottom: -80,
  },
  podiumTeam: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 5,
  },
  podiumPoints: {
    fontSize: 14,
    color: "white",
    backgroundColor: "#5971C9",
    padding: 6,
    width: 66,
    alignItems: "center",
    textAlign: "center",
    borderRadius: 10,
  },
  teamImage: {
    width: 60,
    height: 60,
  },

  remainingTeamsContainer: {
    flex: 1,
    backgroundColor: "#D2E9FF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 15,
    width: 370,
    alignSelf: "center",
    marginTop: -100,
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

  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#263A83",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "transparent",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#263A83",
  },
  teamIcon: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  points: {
    fontSize: 14,
    color: "gray",
  },
  acquired: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PodioPontuacao;
