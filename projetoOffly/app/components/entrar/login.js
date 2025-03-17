import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { db, auth } from "../../firebase/firebaseApi";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [focusField, setFocusField] = useState("");
  const [emailBarWidth] = useState(new Animated.Value(email ? 100 : 0));
  const [passwordBarWidth] = useState(new Animated.Value(password ? 100 : 0));

  const router = useRouter();

  const handleFocus = (field) => {
    const animatedWidth = field === "email" ? emailBarWidth : passwordBarWidth;
    Animated.timing(animatedWidth, {
      toValue: 100,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (field) => {
    const animatedWidth = field === "email" ? emailBarWidth : passwordBarWidth;
    if ((field === "email" && email === "") || (field === "password" && password === "")) {
      Animated.timing(animatedWidth, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  };

  // após login
  // se o utilizador tiver equipa deve ir para a pagina onde ja existe equipa. caso contrario vai para a página de procurar equipa
  const handleSubmit = async () => {
    try {
      // Realizar o login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // O usuário autenticado
      console.log("Login realizado com sucesso!", user);
  
      // Após o login, acessar o Firestore para obter o campo 'team'
      const userDocRef = doc(db, "users", user.uid); // Referência ao documento do usuário
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data(); // Dados do documento
  
        if (userData.team) {
          // Se o campo 'team' existir e não estiver vazio, redirecionar para a página principal
          router.push("../../components/navbar");
        } else {
          // Caso contrário, redirecionar para a página inicial
          router.push("../../PaginaPrincipal");
        }
      } else {
        console.error("Documento do usuário não encontrado no Firestore.");
        setError("Dados do usuário não encontrados. Contate o suporte.");
      }
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError("Falha ao fazer login: " + err.message);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.wrapLogin}>
        <Text style={styles.title}>Bem vindo</Text>

        <View style={styles.wrapInput}>
          <TextInput
            style={[
              styles.input,
              (focusField === "email" || email !== "") && styles.focusedInput,
            ]}
            placeholder="Email"
            placeholderTextColor="#adadad"
            value={email}
            autoCapitalize="none"
            onChangeText={setEmail}
            onFocus={() => {
              setFocusField("email");
              handleFocus("email");
            }}
            onBlur={() => {
              setFocusField("");
              handleBlur("email");
            }}
          />
          <Animated.View
            style={[
              styles.bar,
              {
                width: emailBarWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.wrapInput}>
          <TextInput
            style={[
              styles.input,
              (focusField === "password" || password !== "") && styles.focusedInput,
            ]}
            placeholder="Password"
            placeholderTextColor="#adadad"
            value={password}
            secureTextEntry
            autoCapitalize="none"
            onChangeText={setPassword}
            onFocus={() => {
              setFocusField("password");
              handleFocus("password");
            }}
            onBlur={() => {
              setFocusField("");
              handleBlur("password");
            }}
          />
          <Animated.View
            style={[
              styles.bar,
              {
                width: passwordBarWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.textCenter}>
          <Text style={styles.txt1}>Ainda não tens conta?</Text>
          <TouchableOpacity onPress={() => router.push("./components/entrar/registo")}>
            <Text style={styles.txt2}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D2E9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  wrapLogin: {
    width: 350,
    backgroundColor: "#263A83",
    borderRadius: 10,
    overflow: "hidden",
    padding: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 30,
    color: "azure",
    textAlign: "center",
    marginBottom: 30,
  },
  wrapInput: {
    width: "100%",
    position: "relative",
    marginBottom: 30,
  },
  input: {
    fontSize: 16,
    color: "white",
    backgroundColor: "transparent",
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#adadad",
    outlineStyle: "none",
  },
  focusedInput: {
    borderBottomColor: "#E3FC87",
  },
  bar: {
    height: 2,
    backgroundColor: "#E3FC87",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  loginButton: {
    backgroundColor: "#E3FC87",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonText: {
    fontSize: 16,
    color: "black",
    textTransform: "uppercase",
  },
  errorText: {
    fontSize: 14,
    color: "#E3FC87",
    textAlign: "center",
    marginBottom: 10,
  },
  textCenter: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  txt1: {
    fontSize: 14,
    color: "#adadad",
  },
  txt2: {
    fontSize: 14,
    color: "#E3FC87",
    fontWeight: "bold",
    marginLeft: 5,
  },
});
