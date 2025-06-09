import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { baseurl } from "../../api-config/apiConfig";

const diasDaSemana = ["S", "T", "Q", "Q", "S", "S", "D"];

const DesafioSemanal = () => {
  const { teamId } = useLocalSearchParams();
  const router = useRouter();
  const intervaloRef = useRef(null);

  const [desafio, setDesafio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [participantes, setParticipantes] = useState([]);

  useEffect(() => {
    const fetchDesafio = async () => {
      if (!teamId) {
        console.error("Parâmetro teamId não fornecido.");
        setLoading(false);
        return;
      }

      try {
        const responseDesafio = await fetch(`${baseurl}/api/${teamId}`);
        if (!responseDesafio.ok) throw new Error("Erro ao buscar desafio");
        const data = await responseDesafio.json();
        const imagemUrl = `${baseurl}/api/desafios/imagem/${data.challenges_id}`;

        const responseDatas = await fetch(`${baseurl}/api/challenges/dates/${teamId}`);
        if (!responseDatas.ok) throw new Error("Erro ao buscar datas");
        const datas = await responseDatas.json();

        setDesafio({
          id: data.challenges_id,
          title: data.title,
          description: data.description,
          imagem: imagemUrl,
          start: datas.starting_date,
          end: datas.end_date,
        });

        const responseParticipantes = await fetch(`${baseurl}/api/participants/${teamId}`);
        if (!responseParticipantes.ok) throw new Error("Erro ao buscar participantes");
        const participantesData = await responseParticipantes.json();

        const formatted = participantesData.map((user) => {
          let parsedStreak = [];
          try {
            parsedStreak = JSON.parse(user.streak).map((val) => val === "1");
          } catch (e) {
            console.warn("Erro ao converter streak:", user.streak);
            parsedStreak = Array(7).fill(false);
          }

          return {
            name: user.username,
            image: user.image,
            status: parsedStreak,
          };
        });

        setParticipantes(formatted);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesafio();
  }, [teamId]);

  useEffect(() => {
    if (!desafio || !desafio.end) return;

    const endTime = new Date(desafio.end);

    const updateTimer = async () => {
      const now = new Date();
      const timeRemaining = endTime - now;

      if (timeRemaining <= 0) {
        setTimer({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(intervaloRef.current);

        try {
          await fetch(`${baseurl}/api/challenges/validate/${teamId}`, {
            method: "POST",
          });
        } catch (error) {
          console.error("Erro ao validar desafio:", error);
        }
      } else {
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        setTimer({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    intervaloRef.current = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(intervaloRef.current);
    };
  }, [desafio]);

  const valorPorBolinha = participantes.length ? 100 / (7 * participantes.length) : 0;
  const bolinhasAzuis = participantes.reduce((total, p) => {
    return total + p.status.filter((s) => s === true).length;
  }, 0);
  const progresso = Math.max(0, Math.min(100, (bolinhasAzuis * valorPorBolinha).toFixed(2)));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("../../components/navbar")}
      >
        <Svg width={36} height={35} viewBox="0 0 36 35" fill="none">
          <Circle cx="18.1351" cy="17.1713" r="16.0177" stroke="#263A83" strokeWidth={2} />
          <Path
            d="M21.4043 9.06396L13.1994 16.2432C12.7441 16.6416 12.7441 17.3499 13.1994 17.7483L21.4043 24.9275"
            stroke="#263A83"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Desafio da Semana</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#263A83" />
      ) : desafio ? (
        <>
          <View style={styles.timerContainer}>
            <View style={styles.timer}>
              <Text style={styles.timerText}>
                {timer.days}d {timer.hours}h {timer.minutes}m {timer.seconds}s
              </Text>
            </View>
          </View>

          <View style={styles.cardContainer}>
            <View style={styles.mainCard}>
              {desafio.imagem && (
                <Image
                  source={{ uri: desafio.imagem }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.mainDescription}>{desafio.description}</Text>
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
                <Text style={styles.progressTextInside}>{progresso}/100</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.participantsContainer}>
            <Text style={styles.participantsTitle}>Participantes</Text>
            {participantes.map((p, index) => (
              <View key={index} style={styles.card}>
                <Image source={{ uri: p.image }} style={styles.peopleImage} />
                <Text style={styles.participantText}>{p.name}</Text>
                <View style={styles.circlesWrapperSingleRow}>
                  {p.status.map((status, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.circle,
                        {
                          backgroundColor:
                            status === true
                              ? "#263A83" // azul
                              : status === false
                              ? "#A9A9A9" // cinzento escuro
                              : "#D3D3D3", // cinzento claro
                        },
                      ]}
                    >
                      <Text style={styles.circleText}>{diasDaSemana[idx]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.loadingText}>Nenhum desafio disponível.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "white",
    paddingTop: 50,
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
    borderRadius: 20,
    borderColor: "#263A83",
    borderWidth: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  mainDescription: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
    textAlign: "center",
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 30,
    backgroundColor: "#E0E0E0",
    borderRadius: 30,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
  progressTextInside: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    left: 20,
    top: 5,
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
  circlesWrapperSingleRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center", 
  alignItems: "center",
  maxWidth: 110, 
  rowGap: 4,
  columnGap: 4,
  marginTop: 4,
  marginLeft: "auto", 
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
  loadingText: {
    fontSize: 16,
    color: "#263A83",
  },
  backButton: {
    position: "absolute",
    top: 65,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderColor: "#263A83",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  cardImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 50,
  },
});

export default DesafioSemanal;

