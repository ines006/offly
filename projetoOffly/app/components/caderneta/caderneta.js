import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi";
import { useRouter } from "expo-router";

const Caderneta = () => {
  const [validatedCards, setValidatedCards] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchValidatedCards = async () => {
      try {
        const cardsRef = collection(db, "cartas");
        const q = query(cardsRef, where("validada", "==", true));
        const querySnapshot = await getDocs(q);

        const cards = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setValidatedCards(cards);
      } catch (error) {
        console.error("Erro ao buscar cartas validadas:", error);
      }
    };

    fetchValidatedCards();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>&lt;</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Caderneta</Text>
        <View style={styles.viewcaderneta}>
        <Text style={styles.sectionTitle}>Desafios semanais</Text>
        <Text style={styles.subtitle}>Vê os desafios das semanas passadas</Text>
        <View style={styles.cardRow}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} number={index + 1} />
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Desafios diários</Text>
        <Text style={styles.subtitle}>
          Consulta os desafios dos teus colegas de equipa
        </Text>
        <View style={styles.cardGrid}>
          {Array.from({ length: 31 }).map((_, index) => {
            if (index < validatedCards.length) {
              const card = validatedCards[index];
              return (
                <Card
                  key={card.id}
                  number={card.id}
                  title={card.titulo}
                  content={card.carta}
                  hasIcon={true}
                />
              );
            }
            return <Card key={index} number={index + 1} hasIcon={false} />;
          })}
        </View>
      </View>
      </View>
    </ScrollView>
  );
};

const Card = ({ number, title, content, hasIcon }) => {
  return (
    <View
      style={[
        styles.card,
        hasIcon ? styles.activeCard : styles.inactiveCard,
      ]}
    >
      {title ? (
        <>
          <Text style={styles.cardTitle}>{title}</Text>
        </>
      ) : (
        <View style={styles.cardContentContainer}>
          <Text style={styles.cardPlaceholder}>?</Text>
          <Text style={styles.cardNumber}>{number}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1, 
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#263A83",
    top: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#263A83",
    marginBottom: 15,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "22%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderColor: "#263A83",
    borderWidth: 3,
    marginBottom: 15,
    padding: 10,
    

    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4, 
    elevation: 5, 
  },
  activeCard: {
    backgroundColor: "#D8EAF8",
  },
  inactiveCard: {
    backgroundColor: "#EDEDF1",
    borderColor: "#263A83",
    borderWidth: 1,
    borderStyle: "dashed", 
},
  cardIcon: {
    fontSize: 24,
    marginBottom: 5,
    color: "#2D2F45",
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D2F45",
    position: "absolute", 
    left: 20,
    top: 40,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D2F45",
    textAlign: "center",
    marginBottom: 5,
  },
  cardContent: {
    fontSize: 14,
    color: "#6C6F90",
    textAlign: "center",
  },
  divider: {
    height: 3,
    backgroundColor: "#263A83",
    marginVertical: 20,
  },
  cardContentContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  cardPlaceholder: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#C5C6D0",
    textAlign: "center",
  },
  viewcaderneta:{ 
    top: 60,
  },
  backButton: {
    position: "absolute",
    top: 40, 
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent", 
    borderWidth: 2, 
    borderColor: "#263A83", 
    justifyContent: "center",
    alignItems: "center",
  },

  backButtonText: {
    color: "#263A83", 
    fontSize: 30,
    alignItems: "center",
    marginTop:-4,
  },
});

export default Caderneta;
