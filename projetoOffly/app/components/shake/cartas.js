import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { AuthContext } from "../entrar/AuthContext";
import { baseurl } from "../../api-config/apiConfig";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const cardImages = {
  1: require("../../imagens/desafiodiario1.png"),
  2: require("../../imagens/desafiodiario2.png"),
  3: require("../../imagens/desafiodiario3.png"),
};

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [scaleAnimations, setScaleAnimations] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]);
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    async function fetchGeneratedCards() {
      try {
        if (!user || !user.id) {
          Alert.alert("Erro", "Utilizador não autenticado.");
          return;
        }

        const response = await axios.post(`${baseurl}/api/shake/generate-challenges`, {
          userId: user.id,
        });

        const content = response.data.challenges;

        const challengesArray = content.map((item, index) => ({
          id: index + 1,
          title: item.title.trim(),
          description: item.description.trim(),
          level: item.level === "fácil" ? 1 : item.level === "intermédio" ? 2 : 3,
        }));

        setCards(challengesArray);
        setSelectedCard(null);
        setScaleAnimations(challengesArray.map(() => new Animated.Value(1)));
        setRevealedCards(challengesArray.map(() => false));
      } catch (error) {
        console.error("❌ Erro ao gerar desafios:", error);
        Alert.alert("Erro", "Não foi possível gerar os desafios.");
      }
    }

    fetchGeneratedCards();
  }, []);

  const handleCardSelect = (index) => {
    setSelectedCard(cards[index]);

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

  const handleSelectButton = async () => {
    if (!user || !user.id) {
      Alert.alert("Erro", "É necessário estar autenticado.");
      return;
    }

    if (!selectedCard) {
      Alert.alert("Erro", "Nenhuma carta selecionada.");
      return;
    }

    try {
      const payload = {
        userId: user.id,
        title: selectedCard.title,
        description: selectedCard.description,
        challengeLevelId: selectedCard.level,
      };

      await axios.post(`${baseurl}/api/shake/save-challenge`, payload);

      const selectedIndex = cards.indexOf(selectedCard);
      router.push({
        pathname: "./cartaSelecionada",
        params: {
          card: JSON.stringify(selectedCard),
          cardNumber: selectedIndex + 1,
        },
      });
    } catch (error) {
      console.error("❌ Erro ao guardar seleção:", error);
      Alert.alert("Erro", "Não foi possível registar a carta.");
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
                {revealedCards[index] && (
                  <Image
                    source={cardImages[card.level]}
                    style={styles.cardImage}
                    resizeMode="cover"
                    accessibilityLabel={`Carta nível ${card.level}`}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCard && (
          <View style={styles.mainCard}>
            <Image
              source={cardImages[selectedCard.level]}
              style={styles.cardImage}
              resizeMode="cover"
              accessibilityLabel={`Imagem da carta selecionada - nível ${selectedCard.level}`}
            />
            <View style={styles.cardContent}>
              <Text style={styles.mainTitle}>{selectedCard.title}</Text>
              <Text style={styles.mainDescription}>{selectedCard.description}</Text>
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
    marginTop: -20,
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
