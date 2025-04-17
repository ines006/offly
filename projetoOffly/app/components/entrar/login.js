import React, { useState, useEffect } from "react";
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
    if (
      (field === "email" && email === "") ||
      (field === "password" && password === "")
    ) {
      Animated.timing(animatedWidth, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSubmit = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("Login realizado com sucesso!", user);

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.team) {
          router.push("../../components/navbar");
        } else {
          router.push("../../PaginaPrincipal");
        }
      } else {
        console.error("Documento do usuário não encontrado no Firestore.");
        setError("Dados do usuário não encontrados. Contate o suporte.");
      }
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError(
        "O email ou a palavra-passe que preencheste não são válidos. Tenta novamente!"
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapLogin}>
        <Text style={styles.h1} accessibilityRole="header">
          Bem-vindo!
        </Text>
        <Text style={styles.h4} accessibilityRole="text">
          Início de sessão na Offly
        </Text>

        <View style={styles.wrapInput}>
          <Text
            nativeID="emailLabel"
            style={styles.subtitles}
            accessibilityRole="text"
          >
            Endereço de Email
          </Text>
          <TextInput
            style={[
              styles.input,
              (focusField === "email" || email !== "") && styles.focusedInput,
            ]}
            placeholder="Escreva o seu email"
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
            accessibilityLabel="Endereço de e-mail"
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
          <Text
            nativeID="passwordLabel"
            style={styles.subtitles}
            accessibilityRole="text"
            accessibilityLabel="Palavra-passe"
          >
            Palavra-passe
          </Text>
          <TextInput
            style={[
              styles.input,
              (focusField === "password" || password !== "") &&
                styles.focusedInput,
            ]}
            placeholder="Escreva a sua palavra-passe"
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
            accessibilityLabel="Palavra-passe"
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

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleSubmit}
          accessibilityRole="button"
        >
          <Text style={styles.loginButtonText} accessibilityLabel="Entrar">
            Entrar
          </Text>
        </TouchableOpacity>

        <View style={styles.textCenter}>
          <Text
            style={styles.txt1}
            accessibilityRole="text"
            accessibilityLabel="Ainda não tens conta?"
          >
            Ainda não tens conta?
          </Text>
          <TouchableOpacity
            onPress={() => router.push("./components/entrar/registo")}
          >
            <Text
              style={styles.txt2}
              accessibilityRole="link"
              accessibilityLabel="Registar-me"
            >
              Registar-me
            </Text>
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
    backgroundColor: "#C7E0F8", // Cor de fundo que ocupa a tela toda
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
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
  h1: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#E3FC87",
    textAlign: "center",
    marginBottom: 15,
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
    fontWeight: 400,
  },
  errorText: {
    fontSize: 14,
    color: "#FFBDBD",
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
  subtitles: {
    fontSize: 15,
    color: "azure",
    fontWeight: 500,
  },
  h4: {
    fontSize: 15,
    color: "#E3FC87",
    fontWeight: 400,
    marginBottom: 15,
    textAlign: "center",
  },
});
