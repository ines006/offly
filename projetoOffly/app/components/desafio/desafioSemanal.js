import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../../firebase/firebaseApi";
import { collection, getDocs } from "firebase/firestore";

const CartaEParticipantes = () => {
  const [participantes, setParticipantes] = useState([]);
  const desafio = "Utiliza o Instagram no máximo 10 minutos por dia";
  const diasDaSemana = ["S", "T", "Q", "Q", "S", "S", "D"];

  const [timer, setTimer] = useState({
    days: 6,
    hours: 23,
    minutes: 59,
  });

  const progress = 85;

  useEffect(() => {
    const fetchParticipantes = async () => {
      try {
        const participantesList = [];
        const subCollections = [
          "participante1",
          "participante2",
          "participante3",
          "participante4",
          "participante5",
        ];

        for (const subCollection of subCollections) {
          const subCollectionRef = collection(
            db,
            "desafioTeste",
            "equipaId",
            subCollection
          );
          const participantSnapshot = await getDocs(subCollectionRef);

          participantSnapshot.docs.forEach((participantDoc) => {
            const data = participantDoc.data();

            const participantInfo = {
              name: participantDoc.id,
              status: [1, 2, 3, 4, 5, 6, 7].map((num) =>
                data && num in data ? data[num] : null // true, false ou null
              ),
            };

            participantesList.push(participantInfo);
          });
        }

        setParticipantes(participantesList);
      } catch (error) {
        console.error("Erro ao buscar participantes: ", error);
      }
    };

    fetchParticipantes();
  }, []);

  // Calcular o valor de cada bolinha de acordo com os 100 porcento e dividir pelo numero de participantes a dividir por 7 que são os dias da semana. Isto equivale ao numero de participantes * 7
  const valorPorBolinha = participantes.length
    ? 100 / (7 * participantes.length) // 100 dividido por (7 vezes o número de participantes)
    : 0;

  // Calcular o número de bolinhas azuis (status === true) pois só elas é que somam pontos para a barra de progresso
  const bolinhasAzuis = participantes.reduce((total, participante) => {
    const statusTrue = participante.status.filter((status) => status === true).length;
    return total + statusTrue;
  }, 0);

  // Calcular o progresso de acordo com o número de bolinhas em azul vezes o valor de cada bolinha. 
  const progresso = (bolinhasAzuis * valorPorBolinha).toFixed(2);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Desafio da Semana</Text>

      {/* Timer semanal */}
      <View style={styles.timerContainer}>
        <View style={styles.timer}>
          <Text style={styles.timerText}>
            {timer.days}d {timer.hours}h {timer.minutes}m
          </Text>
        </View>
      </View>

      {/* Carta do desafio */}
      <View style={styles.cardContainer}>
        <View style={styles.mainCard}>
          <Text style={styles.mainDescription}>{desafio}</Text>
        </View>
      </View>

      {/* Barra de progresso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={["rgba(38, 58, 131, 1)", "rgba(38, 58, 131, 0)"]}
            style={[styles.progressBar, { width: `${progresso}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.progressTextInside}>
              {progresso}/100
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Lista de participantes */}
      <View style={styles.participantsContainer}>
        <Text style={styles.participantsTitle}>Participantes</Text>
        {participantes.map((participante, index) => (
          <View key={index} style={styles.card}>
            <Image
              source={require("../../imagens/2.png")}
              style={styles.peopleImage}
            />
            <Text style={styles.participantText}>{participante.name}</Text>
            <View style={styles.circlesWrapper}>
              {/* Linha de cima com 4 dias */}
              <View style={styles.rowTop}>
                {participante.status.slice(0, 4).map((status, idx) => (
                  <View
                    key={`top-${idx}`}
                    style={[
                      styles.circle,
                      {
                        backgroundColor:
                          status === true
                            ? "#263A83" 
                            : status === false
                            ? "#A9A9A9" 
                            : "#D3D3D3", 
                      },
                    ]}
                  >
                    <Text style={styles.circleText}>
                      {diasDaSemana[idx]}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Linha de baixo com 3 dias */}
              <View style={styles.rowBottom}>
                {participante.status.slice(4).map((status, idx) => (
                  <View
                    key={`bottom-${idx}`}
                    style={[
                      styles.circle,
                      {
                        backgroundColor:
                          status === true
                            ? "#263A83" 
                            : status === false
                            ? "#A9A9A9" 
                            : "#D3D3D3", 
                      },
                    ]}
                  >
                    <Text style={styles.circleText}>
                      {diasDaSemana[idx + 4]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "white",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timer: {
    backgroundColor: "#e3fc87",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  timerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#263A83",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#263A83",
    textAlign: "center",
    marginVertical: 20,
  },
  cardContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  mainCard: {
    width: 210,
    height: 360,
    backgroundColor: "#e3fc87",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  mainDescription: {
    color: "black",
    fontSize: 28,
    fontWeight: "bold",
    padding: 10,
    textAlign: "center",
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: 5,
  },
  progressBarBackground: {
    height: 30,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
    borderRadius: 30,
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
  progressTextInside: {
    color: "white",
    fontWeight: "bold",
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: -50 }, { translateY: -10 }],
    fontSize: 16,
  },
  participantsContainer: {
    marginTop: 20,
    backgroundColor: "#D2E9FF",
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  participantsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: 10,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  participantText: {
    fontSize: 16,
    color: "#263A83",
    marginLeft: 10,
    fontWeight: "bold",
  },
  peopleImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  circlesWrapper: {
    marginLeft: "auto",
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "center",
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#263A83",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  circleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    fontSize: 16,
    color: "#263A83",
  },
});

export default CartaEParticipantes;
