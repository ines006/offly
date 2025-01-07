import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [scaleAnimations, setScaleAnimations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchCards() {
      const querySnapshot = await getDocs(collection(db, "cartas"));
      const fetchedCards = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id, // Inclui o ID do documento
      }));

      const shuffledCards = fetchedCards.sort(() => 0.5 - Math.random()).slice(0, 3);
      setCards(shuffledCards);
      setSelectedCard(shuffledCards[0]);

      setScaleAnimations(shuffledCards.map(() => new Animated.Value(1)));
    }

    fetchCards();
  }, []);

  const handleCardSelect = (index) => {
    setSelectedCard(cards[index]);
    scaleAnimations.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === index ? 1.1 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSelectButton = () => {
    if (selectedCard) {
      const selectedIndex = cards.indexOf(selectedCard);
      router.push({
        pathname: "./cartaSelecionada",
        params: { card: JSON.stringify(selectedCard), cardNumber: selectedIndex + 1 },
      });
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.infoText}>Três cartas, um desafio</Text>
        <Text style={styles.questionText}>Qual vais escolher?</Text>

        <View style={styles.topCards}>
          {cards.map((card, index) => (
            <TouchableOpacity key={index} onPress={() => handleCardSelect(index)}>
              <Animated.View
                style={[
                  styles.smallCard,
                  { transform: [{ scale: scaleAnimations[index] || 1 }] },
                ]}
              >
                <Text style={styles.cardText}>Carta {index + 1}</Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCard && (
          <View style={styles.mainCard}>
            <Text style={styles.mainTitle}>{selectedCard.titulo}</Text>
            <Text style={styles.mainDescription}>{selectedCard.carta}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.selectButton} onPress={handleSelectButton}>
          <Text style={styles.selectButtonText}>Selecionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#BFE0FF",
  },
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#E3F1FF",
    height: screenHeight,
    width: screenWidth,
  },
  infoText: {
    fontSize: 16,
    color: "#4C4B49",
    fontWeight: "bold",
    marginTop: 60,
  },
  questionText: {
    fontSize: 24,
    color: "#4C4B49",
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: -45,
  },
  topCards: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
  },
  smallCard: {
    width: 100,
    height: 150,
    backgroundColor: "#2E3A8C",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  mainCard: {
    width: 200,
    height: 300,
    backgroundColor: "#2E3A8C",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  mainTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mainDescription: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
  },
  selectButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  selectButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
