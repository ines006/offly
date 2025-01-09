import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [scaleAnimations, setScaleAnimations] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]); // Estado para controlar se as cartas foram reveladas
  const router = useRouter();

  useEffect(() => {
    async function fetchCards() {
      const querySnapshot = await getDocs(collection(db, "cartas"));
      const fetchedCards = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const shuffledCards = fetchedCards.sort(() => 0.5 - Math.random()).slice(0, 3);
      setCards(shuffledCards);
      setSelectedCard(shuffledCards[0]);

      setScaleAnimations(shuffledCards.map(() => new Animated.Value(1)));
      setRevealedCards(shuffledCards.map(() => false)); // Inicializa com todas as cartas como não reveladas
    }

    fetchCards();
  }, []);

  const handleCardSelect = (index) => {
    setSelectedCard(cards[index]);

    // Revela a carta selecionada
    setRevealedCards((prev) =>
      prev.map((isRevealed, i) => (i === index ? true : isRevealed))
    );

    scaleAnimations.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === index ? 1.2 : 1,
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
                  {
                    transform: [{ scale: scaleAnimations[index] || 1 }],
                    borderColor: selectedCard === card ? "white" : "#535E88",
                    backgroundColor: revealedCards[index] ? "white" : "#2E3A8C", 
                  },
                ]}
              >
                {revealedCards[index] && card.imagem && ( // Só exibe a imagem se a carta for revelada
                  <Image
                    source={{ uri: card.imagem }}
                    style={styles.smallCardImage}
                    resizeMode="cover"
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCard && (
          <View style={styles.mainCard}>
            {selectedCard.imagem && (
              <Image
                source={{ uri: selectedCard.imagem }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.cardContent}>
              <Text style={styles.mainTitle}>{selectedCard.titulo}</Text>
              <Text style={styles.mainDescription}>{selectedCard.carta}</Text>
            </View>
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
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  smallCardImage: {
    width: "100%",
    height: "100%",
  },
  mainCard: {
    width: 210,
    height: 360,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between", 
    padding: 10,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 230,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainTitle: {
    color: "#2E3A8C",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  mainDescription: {
    color: "#2E3A8C",
    fontSize: 12,
    textAlign: "center",
  },
  selectButton: {
    marginTop: 20,
    backgroundColor: "#2E3A8C",
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
