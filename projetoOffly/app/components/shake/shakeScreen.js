import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { getAuth } from "firebase/auth"; // Importa autenticação Firebase
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseApi"; // Ajuste o caminho para sua configuração do Firestore
import Shake from "./shake";
import CartaSelecionada from "./cartaSelecionada"; // Certifique-se de ter o componente CartaSelecionada
import CartaDoUtilizador from "./cartaSelecionada2";
import CartaSelecionada2 from "./cartaSelecionada2";

export default function ShakeScreen({ userId }) {
  const [loading, setLoading] = useState(true);
  const [carta, setCarta] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(userId);
  

  useEffect(() => {
    // Verifica e obtém o ID do utilizador logado se não fornecido
    const fetchUserId = () => {
      if (!userId) {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          setCurrentUserId(currentUser.uid);
        } else {
          console.error("Nenhum utilizador autenticado encontrado.");
        }
      }
    };

    fetchUserId();
  }, [userId]);

  useEffect(() => {
  const fetchCarta = async () => {
    try {
      console.log("Fetching cartas para user:", currentUserId);
      const cartasRef = collection(db, "users", currentUserId, "cartas");

      // Traz todas as cartas
      const q = query(cartasRef);
      const querySnapshot = await getDocs(q);

      console.log("Query Snapshot Size:", querySnapshot.size);

      if (!querySnapshot.empty) {
        // Filtra cartas que não têm o campo `validada` ou onde `validada === false`
        const cartaPendente = querySnapshot.docs.find(doc => {
          const data = doc.data();
          return data.validada === false || data.validada === undefined;
        });

        if (cartaPendente) {
          console.log("Carta encontrada:", cartaPendente.data());
          setCarta({
            id: cartaPendente.id,
            ...cartaPendente.data(),
          });
        } else {
          console.log("Nenhuma carta pendente de validação encontrada.");
        }
      } else {
        console.log("Nenhuma carta encontrada no Firestore.");
      }
    } catch (error) {
      console.error("Erro ao buscar carta no Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  if (currentUserId) {
    fetchCarta();
  }
}, [currentUserId]);

const handleValidated = () => {
    console.log("Carta validada com sucesso!");
   
    setCarta(null); 
    setLoading(true); 
  };

 
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#263A83" />
      </View>
    );
  }

  
  if (!carta) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Nenhuma carta precisa de validação.</Text>
        <Shake />
      </View>
    );
  }

  
  return <CartaSelecionada2 carta={carta} userId={currentUserId} cartaId={carta.id} onValidated={handleValidated} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    color: "#FF0000",
    fontSize: 16,
    fontWeight: "bold",
  },
  cardContainer: {
    width: "90%",
    padding: 20,
    borderWidth: 1,
    borderColor: "#263A83",
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  cardImage: {
    width: 150,
    height: 200,
    marginBottom: 10,
  },
  missingImageText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#aaa",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#263A83",
    textAlign: "center",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});
