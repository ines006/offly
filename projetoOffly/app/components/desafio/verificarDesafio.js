import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseApi";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";

const VerificacaoDesafio = () => {
  const router = useRouter();

  useEffect(() => {
    const verificarDesafio = async (user) => {
      try {
        // Verifica se o utilizador está autenticado
        if (!user) {
          console.error("Utilizador não autenticado.");
          router.push("/components/entrar/login");
          return;
        }

        console.log("ID do utilizador autenticado:", user.uid);

        // Referência do documento do utilizador
        const userDocRef = doc(db, "users", user.uid); // Nome da coleção deve ser consistente
        console.log("Referência do documento do utilizador:", userDocRef.path);

        // Obtém o documento do usuário
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error("Documento do utilizador não encontrado!");
          router.push("/components/desafio/descobrirDesafio");
          return;
        }

        const userData = userDoc.data();
        console.log("Dados do utilizador:", userData);

        const teamName = userData.team?.trim();
        if (!teamName) {
          console.error("Nome da equipa não encontrado no documento do utilizador.");
          router.push("/components/desafio/descobrirDesafio");
          return;
        }

        console.log("Nome da equipa do utilizador", teamName);

        // Verifica o documento na subcoleção equipasDesafio
        const teamDocRef = doc(db, "desafioSemanal/carta1/equipasDesafio", teamName);
        const teamDoc = await getDoc(teamDocRef);

        console.log("Documento da equipa encontrado:", teamDoc.exists());

        if (teamDoc.exists()) {
          router.push("/components/desafio/desafioSemanal");
        } else {
          router.push("/components/desafio/descobrirDesafio");
        }
      } catch (error) {
        console.error("Erro ao verificar desafio:", error);
        router.push("/components/desafio/descobrirDesafio");
      }
    };

    // Verificar o estado do usuário
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        verificarDesafio(user);
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

export default VerificacaoDesafio;
