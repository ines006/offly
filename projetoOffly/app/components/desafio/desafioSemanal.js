import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../../firebase/firebaseApi";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";

const DesafioSemanal = () => {
  const router = useRouter();
  const [participantes, setParticipantes] = useState([]);
  const [team, setTeam] = useState(null);
  const [timer, setTimer] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const intervaloRef = useRef(null); // Referência para o intervalo
  const desafio = "Utiliza o Instagram no máximo 10 minutos por dia";
  const diasDaSemana = ["S", "T", "Q", "Q", "S", "S", "D"];

  useEffect(() => {
    const fetchTeamAndData = async () => {
      try {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;

        if (!userId) {
          console.error("Usuário não autenticado.");
          return; // Caso o utilizador não esteja autenticado
        }

        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) throw new Error("Usuário não encontrado.");

        const userTeam = userDoc.data().team;
        setTeam(userTeam);

        if (userTeam) {
          const participantesList = [];
          const teamDocRef = doc(
            db,
            "desafioSemanal",
            "carta1",
            "equipasDesafio",
            userTeam
          );

          const subCollections = ["participante1", "participante2", "participante3", "participante4", "participante5"];
          for (const subCollection of subCollections) {
            const subCollectionRef = collection(teamDocRef, subCollection);
            const participantSnapshot = await getDocs(subCollectionRef);

            participantSnapshot.docs.forEach((participantDoc) => {
              const data = participantDoc.data();
              const participantInfo = {
                name: participantDoc.id,
                status: [1, 2, 3, 4, 5, 6, 7].map((num) =>
                  data && num in data ? data[num] : null
                ),
              };
              participantesList.push(participantInfo);
            });
          }

          setParticipantes(participantesList);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Firestore: ", error);
      }
    };

    fetchTeamAndData();
  }, []);

  useEffect(() => {
    const fetchTimerData = async () => {
      try {
        const timerDocRef = doc(db, "desafioSemanal", "carta1", "timer", "timerCarta");
        const timerDoc = await getDoc(timerDocRef);
  
        if (!timerDoc.exists()) throw new Error("Timer não encontrado.");
  
        const timerData = timerDoc.data();
        if (!timerData?.start || !timerData?.end) {
          throw new Error("Dados do timer estão incompletos.");
        }
  
        // Converte strings ISO 8601 para objetos Date
        const startTime = new Date(timerData.start);
        const endTime = new Date(timerData.end);
  
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          throw new Error("As datas do timer são inválidas.");
        }
  
        if (endTime <= startTime) {
          throw new Error("A data de término é anterior ou igual à data de início.");
        }
  
        const updateTimer = () => {
          const now = new Date();
          const timeRemaining = endTime - now;
  
          if (timeRemaining <= 0) {
            setTimer({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            clearInterval(intervaloRef.current); // Para o timer quando o tempo terminar
        
          } else {
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  
            setTimer({ days, hours, minutes, seconds });
          }
        };
  
        updateTimer(); // Atualiza o timer imediatamente
        intervaloRef.current = setInterval(updateTimer, 1000);
      } catch (error) {
        console.error("Erro ao buscar ou validar os dados do timer: ", error);
        setTimer({ days: 0, hours: 0, minutes: 0, seconds: 0 }); // Define valores padrão em caso de erro
      }
    };
  
    fetchTimerData();
  
    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, []);

  const valorPorBolinha = participantes.length
    ? 100 / (7 * participantes.length)
    : 0;

  const bolinhasAzuis = participantes.reduce((total, participante) => {
    const statusTrue = participante.status.filter((status) => status === true).length;
    return total + statusTrue;
  }, 0);

  const progresso = Math.max(0, Math.min(100, (bolinhasAzuis * valorPorBolinha).toFixed(2)));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("../../components/navbar")}
      >
        <Text style={styles.backButtonText}>&lt;</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Desafio da Semana</Text>

      <View style={styles.timerContainer}>
        <View style={styles.timer}>
          <Text style={styles.timerText}>
            {timer.days}d {timer.hours}h {timer.minutes}m {timer.seconds}s
          </Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.mainCard}>
          <Text style={styles.mainDescription}>{desafio}</Text>
        </View>
      </View>

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
    marginTop: -4,
  },
});

export default DesafioSemanal;
