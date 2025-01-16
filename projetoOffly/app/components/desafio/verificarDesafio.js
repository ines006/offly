import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseApi";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";

const VerificacaoDesafios = () => {
  const router = useRouter();

  useEffect(() => {
    const verificarDesafios = async (user) => {
      try {
        // Verifica se o utilizador está autenticado
        if (!user) {
          console.error("Utilizador não autenticado.");
          router.push("/components/entrar/login");
          return;
        }

        console.log("ID do utilizador autenticado:", user.uid);

        // Referência do documento do utilizador
        const userDocRef = doc(db, "users", user.uid);
        console.log("Referência do documento do utilizador:", userDocRef.path);

        // Obtém o documento do utilizador
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error("Documento do utilizador não encontrado!");
          router.push("/components/desafio/descobrirDesafio");
          return;
        }

        const userData = userDoc.data();
        console.log("Dados do utilizador:", userData);

        // Verifica se o nome da equipe existe
        const teamName = userData.team?.trim();
        if (!teamName) {
          console.error("Nome da equipa não encontrado no documento do utilizador.");
          router.push("/components/desafio/descobrirDesafio");
          return;
        }

        console.log("Nome da equipa do utilizador:", teamName);

        // Iterar pelas cartas na coleção desafioSemanal
        const cartas = ["carta0", "carta1", "carta2", "carta3"];
        for (const carta of cartas) {
          const cartaDocRef = doc(db, "desafioSemanal", carta);
          console.log(`Verificando a carta: ${cartaDocRef.path}`);

          const cartaDoc = await getDoc(cartaDocRef);

          if (!cartaDoc.exists()) {
            console.error(`Documento da carta ${carta} não encontrado.`);
            router.push("/components/desafio/descobrirDesafio");
            return;
          }

          const cartaData = cartaDoc.data();
          console.log(`Dados da carta ${carta}:`, cartaData);

          if (cartaData.validada === true) {
            console.log(`Carta ${carta} está validada. Avançando para a próxima...`);
            continue; // Passa para a próxima carta
          } else {
            console.log(`Carta ${carta} não está validada. Verificando subcoleção equipasDesafio...`);

            // Verifica o documento na subcoleção equipasDesafio
            const teamDocRef = doc(db, `desafioSemanal/${carta}/equipasDesafio`, teamName);
            console.log("Referência do documento da equipa:", teamDocRef.path);

            const teamDoc = await getDoc(teamDocRef);

            if (teamDoc.exists()) {
              console.log("Equipe encontrada. Redirecionando para desafio semanal...");
              router.push("/components/desafio/desafioSemanal");
              return;
            } else {
              console.error("Equipe não encontrada. Redirecionando para descobrir desafio...");
              router.push("/components/desafio/descobrirDesafio");
              return;
            }
          }
        }

        // Se todas as cartas estiverem validadas, redireciona para descobrirDesafio
        console.log("Todas as cartas estão validadas. Redirecionando para descobrir desafio...");
        router.push("/components/desafio/descobrirDesafio");
      } catch (error) {
        console.error("Erro ao verificar desafios:", error);
        router.push("/components/desafio/descobrirDesafio");
      }
    };

    // Verificar o estado do utilizador
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        verificarDesafios(user);
      } else {
        console.error("Usuário não autenticado.");
        router.push("/components/entrar/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>Verificando...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default VerificacaoDesafios;
