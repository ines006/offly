import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Svg, Circle, Path } from "react-native-svg";

const DetalhesCaderneta = () => {
  const router = useRouter();
  const {
    dia,
    titulo,
    descricao: rawDescricao,
    imagem,
  } = useLocalSearchParams();

  const descricao =
    rawDescricao ||
    "Hoje o desafio foi dar uma caminhada de 30 minutos ao ar livre para relaxar a mente e manter o corpo ativo!";

  const autores = ["Joana Silva", "Carlos Pinto", "Rita Mendes"];
  const avatares = [
    "https://getavataaars.com/api/?topType=ShortHairShortFlat&accessoriesType=Blank&hairColor=Brown&facialHairType=Blank&clotheType=Hoodie&clotheColor=Blue03&eyeType=Happy&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Light",
    "https://getavataaars.com/api/?topType=ShortHairFrizzle&accessoriesType=Sunglasses&hairColor=Black&facialHairType=BeardLight&clotheType=GraphicShirt&clotheColor=Black&eyeType=Wink&eyebrowType=UpDown&mouthType=Smile&skinColor=DarkBrown",
    "https://getavataaars.com/api/?topType=LongHairStraight2&accessoriesType=Blank&hairColor=Blonde&facialHairType=Blank&clotheType=BlazerShirt&clotheColor=Gray01&eyeType=Default&eyebrowType=RaisedExcited&mouthType=Default&skinColor=Light",
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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

      <Text style={styles.header}>Desafios diários</Text>

      <View style={styles.diaBox}>
        <Text style={styles.diaText}>Dia {dia}</Text>
      </View>

      <View style={styles.mainCardBox}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.innerWhiteBox}>
            {imagem ? (
              <Image source={{ uri: imagem }} style={styles.cardImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Sem imagem</Text>
              </View>
            )}

            <View style={styles.textContainer}>
              <Text style={styles.title}>
                {titulo || "Desafio da Caminhada"}
              </Text>
              <Text style={styles.description}>{descricao}</Text>

              <View style={styles.authorContainer}>
                <Image source={{ uri: avatares[i] }} style={styles.avatar} />
                <Text style={styles.authorText}>
                  Realizado por {autores[i]}
                </Text>
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
    backgroundColor: "#FFFFFF",
    padding: 20,
    paddingTop: 80,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 25,
    zIndex: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: 30,
    textAlign: "center",
  },
  diaBox: {
    backgroundColor: "#263A83",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "center",
    marginBottom: 30,
  },
  diaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  mainCardBox: {
    backgroundColor: "#263A83",
    borderRadius: 20,
    padding: 15,
    gap: 15,
  },
  innerWhiteBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    padding: 15,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 15,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  imagePlaceholderText: {
    color: "#263A83",
  },
  textContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#263A83",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#2D2F45",
    marginBottom: 10,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  authorText: {
    fontSize: 10,
    color: "#2D2F45",
  },
});

export default DetalhesCaderneta;
