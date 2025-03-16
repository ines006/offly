import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseApi"; 
import { useRouter } from "expo-router";
import { Svg, Circle, Path } from "react-native-svg";

const Caderneta = () => {
  const [validatedCards, setValidatedCards] = useState([]);
  const [weeklyChallengeCards, setWeeklyChallengeCards] = useState([]); // Estado para armazenar cartas do desafio semanal
  const router = useRouter();

  useEffect(() => {
    const fetchValidatedCards = async () => {
      try {
        const user = auth.currentUser; 
        if (!user) {
          console.error("Usuário não está autenticado.");
          return;
        }

        const userId = user.uid; 

    
        const cardsRef = collection(db, "users", userId, "cartas");
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

    const fetchWeeklyChallengeCards = async () => {
      try {
       
        const desafioRef = collection(db, "desafioSemanal");
        const q = query(desafioRef, where("validada", "==", true)); // Buscar apenas cartas com "validada" == true
        const querySnapshot = await getDocs(q);

        const desafioCards = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setWeeklyChallengeCards(desafioCards); 
      } catch (error) {
        console.error("Erro ao buscar cartas do desafio semanal:", error);
      }
    };

    fetchValidatedCards();
    fetchWeeklyChallengeCards(); 
  }, []);

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollViewContent} 
      keyboardShouldPersistTaps='handled'
      accessible={false} 
    >
      <View style={styles.container} accessible={true} accessibilityLabel="Página da Caderneta">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Svg width={36} height={35} viewBox="0 0 36 35" fill="none">
            <Circle
              cx="18.1351"
              cy="17.1713"
              r="16.0177"
              stroke="#263A83"
              strokeWidth={2}
            />
            <Path
              d="M21.4043 9.06396L13.1994 16.2432C12.7441 16.6416 12.7441 17.3499 13.1994 17.7483L21.4043 24.9275"
              stroke="#263A83"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>
        
        <Text style={styles.title} accessibilityRole="header" accessibilityLabel="Título: Caderneta">
          Caderneta
        </Text>

      
        <View style={styles.viewcaderneta} accessible={true}>
          <TouchableOpacity>
            <Text style={styles.sectionTitle} accessibilityRole="header" accessibilityLabel="Seção: Desafios semanais">
              Desafios semanais
            </Text>
            <Text style={styles.subtitle} accessibilityRole="text" accessibilityLabel="Vê os desafios das semanas passadas">
              Vê os desafios das semanas passadas
            </Text>
          </TouchableOpacity>
          
          <View style={styles.cardGrid} accessible={true} accessibilityLabel={`Existem ${weeklyChallengeCards.length} desafios semanais`}>
            {weeklyChallengeCards.map((card) => (
              <View
                key={card.id}
                style={[styles.card, styles.activeCard2]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Desafio semanal: ${card.titulo || "Sem título"}`}
              >
                {card.imagem ? (
                  <Image
                    source={{ uri: card.imagem }}
                    style={styles.cardImage2}
                    resizeMode="cover"
                    accessible={true}
                    accessibilityLabel={`Imagem do desafio ${card.titulo}`}
                  />
                ) : (
                  <Text style={styles.cardTitle} accessibilityLabel="Imagem não disponível">Imagem não disponível</Text>
                )}
                <Text style={styles.weeklyCardTitle}>{card.titulo || "Sem título"}</Text>
              </View>
            ))}

            {Array.from({ length: 4 - weeklyChallengeCards.length }).map((_, index) => (
              <View
                key={weeklyChallengeCards.length + index}
                style={[styles.card, styles.inactiveCard]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Desafio semanal ${weeklyChallengeCards.length + index + 1} ainda não disponível`}
              >
                <Text style={styles.cardNumber}>{weeklyChallengeCards.length + index + 1}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} accessible={false} />
          <TouchableOpacity>
            <Text style={styles.sectionTitle} accessibilityRole="header" accessibilityLabel="Seção: Desafios diários">
              Desafios diários
            </Text>
            <Text style={styles.subtitle} accessibilityRole="text" accessibilityLabel="Consulta os desafios dos teus colegas de equipa">
              Consulta os desafios dos teus colegas de equipa
            </Text>
          </TouchableOpacity>
          <View style={styles.cardGrid} accessible={true} accessibilityLabel={`Existem ${validatedCards.length} desafios diários validados`}>
            {Array.from({ length: 31 }).map((_, index) => {
              if (index < validatedCards.length) {
                const card = validatedCards[index];
                return (
                  <Card
                    key={card.id}
                    number={card.id}
                    hasIcon={true}
                    imageUrl={card.imagem} 
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Desafio diário ${card.id} disponível`}
                  />
                );
              }
              return (
                <Card
                  key={index}
                  number={index + 1}
                  hasIcon={false}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Desafio diário ${index + 1} ainda não disponível`}
                />
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const Card = ({ number, imageUrl, hasIcon }) => {
  return (
    <View
      style={[styles.card, hasIcon ? styles.activeCard : styles.inactiveCard]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={hasIcon ? `Desafio diário ${number} disponível` : `Desafio diário ${number} ainda não disponível`}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
          accessible={true}
          accessibilityLabel={`Imagem do desafio ${number}`}
        />
      ) : (
        <View style={styles.cardContentContainer} accessible={true}>
          <Text style={styles.cardPlaceholder} accessible={true}>?</Text>
          <Text style={styles.cardNumber} accessible={true}>{number}</Text>
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
    marginTop: 40,
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
    borderRadius: 8,
    marginBottom: 15,
    elevation: 5,
  },
  activeCard: {
    backgroundColor: "#D8EAF8", 
    borderRadius: 8,
    overflow: "hidden",
  },
  activeCard2: {
    backgroundColor: "#E3FC87", 
    borderRadius: 8,
    overflow: "hidden",
  },
  inactiveCard: {
    backgroundColor: "#EDEDF1", 
    borderColor: "#263A83",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  cardWithImage: {
    overflow: "hidden",
    padding: 0,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardContentContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  cardPlaceholder: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#C5C6D0",
    textAlign: "center",
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D2F45",
    position: "absolute",
    left: 52,
    top: 92,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF", 
    textAlign: "center",
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
  viewcaderneta: {
    top: 60,
  },
  backButton: {
    position: "absolute",
    top: 40,
    width: 40,
    height: 40,
    left: 25,
    borderRadius: 25,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  cardImage2: {
    marginTop: 10,
    width: "100%", 
    height: "60%", 
    alignSelf: "center", 
    borderRadius: 8, 
  },
  weeklyCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black", 
    textAlign: "center",
    marginTop: 5,
  },
});

export default Caderneta;
