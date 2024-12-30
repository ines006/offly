import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseApi";

const PontuacaoEquipa = () => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "equipas"), (snapshot) => {
      const teamsData = snapshot.docs.map((doc) => ({
        id: doc.id, 
        name: doc.id, 
        points: doc.data().pontos, 
        acquired: doc.data().adquiridos, 
      }));

      setTeams(teamsData.sort((a, b) => b.points - a.points));
    });

    return () => unsubscribe();
  }, []);

  return (
    <FlatList
      data={teams}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <View style={styles.card}>
          <View style={styles.rankCircle}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>

          <Image
            source={require("../imagens/1.png")}
            style={styles.teamIcon}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.points}>{item.points} pontos</Text>
          </View>

          <Text
            style={[
              styles.acquired,
              { color: item.acquired >= 0 ? "#1D9A6C" : "#D32F2F" }, 
            ]}
          >
            {item.acquired >= 0 ? `+${item.acquired}` : item.acquired} {item.acquired >= 0 ? "▲" : "▼"}
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    height: 90, 
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
    color: "#1D9A6C", 
    fontWeight: "bold",
  },
});

export default PontuacaoEquipa;
