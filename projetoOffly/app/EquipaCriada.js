import { useFonts } from "expo-font";
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import React, { useState, useEffect } from "react";
import {
  Container_Pagina_Equipa_Criada,
  Sub_Titulos_Criar_Equipa,
  Titulos_Equipa_Criada,
  Caixa_Equipa_Criada,
  Botoes_Pagina_principal,
  Texto_Botoes_Pagina_principal,
  Botoes_Pagina_principal_Desativado,
  Texto_Botoes_Pagina_principal_Desativado,
} from "./styles/styles";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase/firebaseApi";
import { useRouter, useLocalSearchParams } from "expo-router";


export default function EquipaCriada() {

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  const { teamId } = useLocalSearchParams();
  console.log("Team ID:", teamId);
  // const teamId  = "Equipa H" // SIMULAÇÃO
  const [teamDetails, setTeamDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);  // Estado para controle do carregamento
  const [errorLoading, setErrorLoading] = useState(false);
  
  const router = useRouter();

  const fetchData = async () => {
    try {
      setErrorLoading(false);
      const docRef = doc(db, "equipas", teamId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTeamDetails(docSnap.data());
      } else {
        console.error("Documento da equipa não encontrado!");
      }

      const participantsRef = doc(db, "equipas", teamId, "membros", "participantes");
      const participantsSnap = await getDoc(participantsRef);

      if (participantsSnap.exists()) {
        const participantsData = Object.values(participantsSnap.data());
        setParticipants(participantsData);
      } else {
        console.error("Documento de participantes não encontrado!");
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setErrorLoading(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchData();
    }
  }, [teamId]);

  useEffect(() => {
    if (errorLoading) {
      const timer = setTimeout(() => {
        console.log("Tentando carregar novamente os dados...");
        fetchData();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorLoading]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#263A83" />
      </View>
    );
  }

  if (!teamDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Detalhes da equipa não encontrados.</Text>
      </View>
    );
  }

  // Função para entrar no torneio
  const handleTorneio = () => {
    console.log("redirecionar para torneio")
    router.push("./components/pag-principal-lg/pag-principal-lg");
  };

  return (
    <ScrollView style={{backgroundColor: "#fff"}}> 
      <Container_Pagina_Equipa_Criada>
        <Titulos_Equipa_Criada>{teamDetails?.nome}</Titulos_Equipa_Criada>
        <Sub_Titulos_Criar_Equipa>{teamDetails?.descricao}</Sub_Titulos_Criar_Equipa>

        <View style={styles.remainingTeamsContainer}>
  {participants.length > 0 ? (
    <>
      {participants.map((participant, index) => (
        <View key={index} style={styles.card}>
          <Image source={require("./imagens/2.png")} style={styles.peopleImage} />
          <Text style={styles.participantText}>{participant}</Text>
        </View>
      ))}
      <Botoes_Pagina_principal onPress={handleTorneio}>
        <Texto_Botoes_Pagina_principal>Entrar no Torneio</Texto_Botoes_Pagina_principal>
      </Botoes_Pagina_principal>
    </>
  ) : (
    <>
      <Text style={styles.noParticipants}>Nenhum participante encontrado.</Text>
      {/* Botão de Refresh */}
      <Botoes_Pagina_principal onPress={fetchData}>
        <Texto_Botoes_Pagina_principal>Atualizar Participantes</Texto_Botoes_Pagina_principal>
      </Botoes_Pagina_principal>

      <Botoes_Pagina_principal_Desativado>
        <Texto_Botoes_Pagina_principal_Desativado>Entrar no Torneio</Texto_Botoes_Pagina_principal_Desativado>
      </Botoes_Pagina_principal_Desativado>
    </>
  )}
</View>

      </Container_Pagina_Equipa_Criada>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  remainingTeamsContainer: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 15,
    paddingBottom: 15,
    width: 370,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 30,
    marginLeft: 30,
    marginRight: 30,
  },
  card: {
    flexDirection: "row",
    padding: 15,
    width: 330,
    marginVertical: 8,
    marginHorizontal: 10,
    backgroundColor: "#263a83",
    borderRadius: 20,
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    height: 75,
  },
  peopleImage: {
    width: 60,
    height: 60,
  },
  participantText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10,
    fontWeight: "bold",
  },
  noParticipants: {
    fontSize: 16,
    color: "#999",
  },
  refreshButton: {
    marginTop: 20,
    backgroundColor: "#263A83",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  refreshText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});