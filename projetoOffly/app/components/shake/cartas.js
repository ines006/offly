import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { AuthContext } from "../entrar/AuthContext";
import { baseurl } from "../../api-config/apiConfig";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [scaleAnimations, setScaleAnimations] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);

  const rotateAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    animateLoadingCards();
    fetchGeneratedCards();
  }, []);

  function animateLoadingCards() {
    const rotates = rotateAnims.map((anim, idx) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 800 + idx * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      )
    );

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -20,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 20,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([...rotates, floatLoop]).start();
  }

  async function fetchGeneratedCards() {
    try {
      if (!user?.id) {
        Alert.alert("Erro", "Utilizador não autenticado.");
        return;
      }
      setLoadingModalVisible(true);
      const response = await axios.post(`${baseurl}/api/shake/generate-challenges`, { userId: user.id });
      const arr = response.data.challenges.map((item, i) => ({
        id: i + 1,
        title: item.title.trim(),
        description: item.description.trim(),
        level: item.level,
        levelId: item.levelId,
        image: item.image,
      }));
      setCards(arr);
      setSelectedCard(null);
      setScaleAnimations(arr.map(() => new Animated.Value(1)));
      setRevealedCards(arr.map(() => false));
    } catch (error) {
    } finally {
      setLoadingModalVisible(false);
    }
  }

  function handleCardSelect(i) {
    setSelectedCard(cards[i]);
    setRevealedCards(prev => prev.map((r, idx) => idx === i || r));
    scaleAnimations.forEach((anim, idx) =>
      Animated.timing(anim, {
        toValue: idx === i ? 1.2 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    );
  }

  async function handleSelectButton() {
    if (!user?.id) {
      Alert.alert("Erro", "É necessário estar autenticado.");
      return;
    }
    if (!selectedCard) {
      Alert.alert("Erro", "Nenhuma carta selecionada.");
      return;
    }
    try {
      const resp = await axios.post(`${baseurl}/api/shake/save-challenge`, {
        userId: user.id,
        title: selectedCard.title,
        description: selectedCard.description,
        levelId: selectedCard.levelId,
      });
      if (resp.data?.challenge?.id) {
        router.push({
          pathname: "./cartaSelecionada",
          params: { card: JSON.stringify(selectedCard), cardNumber: cards.indexOf(selectedCard) + 1 },
        });
      } else {
        Alert.alert("Erro", "Desafio não foi guardado corretamente.");
      }
    } catch (error) {

    }
  }

  const getRotateStyle = anim =>
    anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={styles.background}>
      <Modal transparent visible={loadingModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>A baralhar as cartas...</Text>
          <View style={styles.deckContainer}>
            {rotateAnims.map((anim, idx) => (
              <Animated.Image
                key={idx}
                source={require("../../imagens/shakeMeDiario.png")}
                style={[
                  styles.loadingCard,
                  {
                    transform: [
                      { rotate: getRotateStyle(anim) },
                      { translateY: floatAnim },
                      { scale: 1 - idx * 0.05 },
                    ],
                    position: 'absolute',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </Modal>

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.infoText}>Três cartas, um desafio</Text>
          <Text style={styles.questionText}>Qual vais escolher?</Text>
        </View>

        <View style={styles.topCards}>
          {cards.map((card, i) => (
            <TouchableOpacity key={i} onPress={() => handleCardSelect(i)}>
              <Animated.View style={[
                styles.smallCard,
                {
                  transform: [{ scale: scaleAnimations[i] }],
                  borderColor: selectedCard === card ? "white" : "#535E88",
                  backgroundColor: revealedCards[i] ? "#FFF" : "#2E3A8C",
                },
              ]}>
                {revealedCards[i] && card.image && (
                  <Image
                    source={{ uri: card.image }}
                    style={styles.cardImageSmall}
                    resizeMode="cover"
                    accessibilityLabel={`Carta nível ${card.levelId}`}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
        {selectedCard && (
          <View style={styles.mainCard}>
            {selectedCard.image && (
              <Image
                source={{ uri: selectedCard.image }}
                style={styles.cardImage}
                resizeMode="contain"
                accessibilityLabel={`Imagem da carta selecionada - nível ${selectedCard.levelId}`}
              />
            )}
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
  cardWrapper: {
  alignItems: 'center', 
  marginTop: 40, 
},
  header: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 35,
  },
  infoText: {
    fontSize: 16,
    color: "#4C4B49",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  questionText: {
    fontSize: 24,
    color: "#4C4B49",
    fontWeight: "bold",
    textAlign: "center",
  },
  topCards: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
  },
  smallCard: {
    width: 100,
    height: 150,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  mainCard: {
    width: 210,
    minHeight: 320,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 170,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardImageSmall: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    marginLeft: 3,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainTitle: {
    color: "#2E3A8C",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  mainDescription: {
    color: "#2E3A8C",
    fontSize: 12,
    textAlign: "center",
  },
  selectButton: {
    backgroundColor: "#2E3A8C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom:10,
  },
  selectButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",

  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#BFE0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  modalText: {
    color: "white",
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold",
  },
  deckContainer: {
    width: 140,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
});

