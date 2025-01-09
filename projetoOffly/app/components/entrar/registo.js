import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseApi";
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
import { doc, setDoc } from "firebase/firestore"; 

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [focusField, setFocusField] = useState("");
  const [usernameBarWidth] = useState(new Animated.Value(0));
  const [emailBarWidth] = useState(new Animated.Value(0));
  const [passwordBarWidth] = useState(new Animated.Value(0));
  const [confirmPasswordBarWidth] = useState(new Animated.Value(0));

  const router = useRouter();

  const handleFocus = (field) => {
    const animatedWidth =
      field === "username"
        ? usernameBarWidth
        : field === "email"
        ? emailBarWidth
        : field === "password"
        ? passwordBarWidth
        : confirmPasswordBarWidth;

    Animated.timing(animatedWidth, {
      toValue: 100,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (field, value) => {
    const animatedWidth =
      field === "username"
        ? usernameBarWidth
        : field === "email"
        ? emailBarWidth
        : field === "password"
        ? passwordBarWidth
        : confirmPasswordBarWidth;

    if (!value) {
      Animated.timing(animatedWidth, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Salvar dados do usuário no Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        createdAt: new Date().toISOString(),
      });
  
      console.log("Registo realizado com sucesso!");
      router.push("../navbar");
    } catch (err) {
      setError("Falha ao fazer registo: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapLogin}>
        <Text style={styles.title}>Criar Conta</Text>

        <View style={styles.wrapInput}>
          <TextInput
            style={[
              styles.input,
              (focusField === "username" || username) && styles.focusedInput,
            ]}
            placeholder="Nome de Utilizador"
            placeholderTextColor="#adadad"
            value={username}
            autoCapitalize="none"
            onChangeText={setUsername}
            onFocus={() => {
              setFocusField("username");
              handleFocus("username");
            }}
            onBlur={() => {
              setFocusField("");
              handleBlur("username", username);
            }}
          />
          <Animated.View
            style={[
              styles.bar,
              {
                width: usernameBarWidth.interpolate({
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
              (focusField === "email" || email) && styles.focusedInput,
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
              handleBlur("email", email);
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
              (focusField === "password" || password) && styles.focusedInput,
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
              handleBlur("password", password);
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

        <View style={styles.wrapInput}>
          <TextInput
            style={[
              styles.input,
              (focusField === "confirmPassword" || confirmPassword) && styles.focusedInput,
            ]}
            placeholder="Confirmar Password"
            placeholderTextColor="#adadad"
            value={confirmPassword}
            secureTextEntry
            autoCapitalize="none"
            onChangeText={setConfirmPassword}
            onFocus={() => {
              setFocusField("confirmPassword");
              handleFocus("confirmPassword");
            }}
            onBlur={() => {
              setFocusField("");
              handleBlur("confirmPassword", confirmPassword);
            }}
          />
          <Animated.View
            style={[
              styles.bar,
              {
                width: confirmPasswordBarWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
          <Text style={styles.loginButtonText}>Registar</Text>
        </TouchableOpacity>

        <View style={styles.textCenter}>
          <Text style={styles.txt1}>Já tens uma conta?</Text>
          <TouchableOpacity onPress={() => router.push("./login")}>
            <Text style={styles.txt2}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Register;

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