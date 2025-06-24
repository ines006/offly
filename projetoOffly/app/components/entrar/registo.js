import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import {
  BotaoNavegacaoContainer,
  Definir_visibilidade_btn,
  Texto_Botoes_Definir_Visibilidade,
} from "../../styles/styles";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFonts } from "expo-font";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseurl } from "../../api-config/apiConfig";
import { AuthContext } from "./AuthContext";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState();
  const [activeButton, setActiveButton] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [focusField, setFocusField] = useState("");
  const [fullNameBarWidth] = useState(new Animated.Value(0));
  const [usernameBarWidth] = useState(new Animated.Value(0));
  const [emailBarWidth] = useState(new Animated.Value(0));
  const [passwordBarWidth] = useState(new Animated.Value(0));
  const [confirmPasswordBarWidth] = useState(new Animated.Value(0));
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [touchedTerms, setTouchedTerms] = useState(false);

  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { setUser, setAccessToken } = useContext(AuthContext);

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../../assets/fonts/Poppins-Regular.ttf"),
  });

  // Array de URLs das imagens p/ users
  const imageUserGirl = [
    "https://celina05.sirv.com/avatares/avatar4.png",
    "https://celina05.sirv.com/avatares/avatar5.png",
    "https://celina05.sirv.com/avatares/avatar6.png",
    "https://celina05.sirv.com/avatares/avatar9.png",
    "https://celina05.sirv.com/avatares/avatar10.png",
    "https://celina05.sirv.com/avatares/avatar11.png",
    "https://celina05.sirv.com/avatares/avatar12.png",
    "https://celina05.sirv.com/avatares/avatar13.png",
    "https://celina05.sirv.com/avatares/avatar16.png",
    "https://celina05.sirv.com/avatares/avatar18.png",
    "https://celina05.sirv.com/avatares/avatar20.png",
  ];

  const imageUserBoy = [
    "https://celina05.sirv.com/avatares/avatar1.png",
    "https://celina05.sirv.com/avatares/avatar2.png",
    "https://celina05.sirv.com/avatares/avatar3.png",
    "https://celina05.sirv.com/avatares/avatar7.png",
    "https://celina05.sirv.com/avatares/avatar8.png",
    "https://celina05.sirv.com/avatares/avatar14.png",
    "https://celina05.sirv.com/avatares/avatar15.png",
    "https://celina05.sirv.com/avatares/avatar17.png",
    "https://celina05.sirv.com/avatares/avatar19.png",
  ];

  // Função para obter uma imagem aleatória com base no gênero
  const getRandomImage = (gender) => {
    if (gender === "Masculino") {
      const randomIndex = Math.floor(Math.random() * imageUserBoy.length);
      return imageUserBoy[randomIndex];
    } else if (gender === "Feminino") {
      const randomIndex = Math.floor(Math.random() * imageUserGirl.length);
      return imageUserGirl[randomIndex];
    }
    return null;
  };

  const handleFocus = (field) => {
    const animatedWidth =
      field === "fullName"
        ? fullNameBarWidth
        : field === "username"
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
      field === "fullName"
        ? fullNameBarWidth
        : field === "username"
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
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, insira um email válido.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As palavras-passes não coincidem.");
      return;
    }

    if (password.length < 8) {
      setError("A palavra-passe deve conter no mínimo 8 caracteres.");
      return;
    }

    if (!fullName || !username || gender === undefined) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!termsAccepted) {
      setError("Por favor, aceite os termos e condições para continuar.");
      return;
    }

    try {
      console.log("🧹 Limpando sessão anterior...");
      // Limpar AsyncStorage
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("user");
      // Limpar AuthContext
      setUser(null);
      setAccessToken(null);

      console.log("🔄 A iniciar registo...");
      const response = await axios.post(`${baseurl}/participants`, {
        name: fullName,
        username: username,
        email: email,
        password: password,
        gender: gender,
        level: 1,
        image: getRandomImage(gender === 0 ? "Masculino" : "Feminino"),
      });

      console.log("✅ Registo concluído:", response.data);
      console.log("🔄 A iniciar login...");

      const authResponse = await axios.post(`${baseurl}/auth/login`, {
        email: email,
        password: password,
      });

      console.log("✅ Login concluído:", authResponse.data);

      const { token, refreshToken, expiresIn, user } = authResponse.data;
      console.log("📦 Dados salvos:", { user, token, refreshToken });

      // Salvar novos dados no AsyncStorage
      await AsyncStorage.setItem("accessToken", token);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // Atualizar AuthContext
      setUser(user);
      setAccessToken(token);

      console.log("✅ Registo e autenticação realizados com sucesso!");
      console.log("🚀 Redirecionando para onboarding...");
      router.push("onboarding");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Erro ao registar. Verifique os dados e tente novamente."
        );
      } else {
        setError("Erro desconhecido. Tente novamente.");
      }
    }
  };

  const handleButtonClick = (button) => {
    setActiveButton(button);
    // Definir 0 para Masculino e 1 para Feminino
    setGender(button === "Masculino" ? 0 : 1);
  };

  useEffect(() => {
    if (searchParams?.aceitouTermos === '1' && !touchedTerms) {
      setTermsAccepted(true);
    }
  }, [searchParams, touchedTerms]);

  if (!fontsLoaded) {
    return null; // Ou um componente de carregamento
  }

  return (
    <View accessibilityRole="main" style={styles.container}>
      <View style={styles.wrapLogin}>
        <Text style={styles.h1} accessibilityRole="header">
          Criar Conta
        </Text>

        {/* Nome Completo */}
        <View style={styles.wrapInput}>
          <Text
            nativeID="nameLabel"
            style={styles.subtitles}
            accessibilityRole="text"
            accessibilityLabel="Nome Completo"
          >
            Nome Completo{" "}
            <Text nativeID="mandatory" style={styles.mandatory}>
              *
            </Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              (focusField === "fullName" || fullName) && styles.focusedInput,
            ]}
            placeholder="Escreva o seu nome completo"
            placeholderTextColor="#adadad"
            value={fullName}
            autoCapitalize="words"
            onChangeText={setFullName}
            onFocus={() => {
              setFocusField("fullName");
              handleFocus("fullName");
            }}
            onBlur={() => {
              setFocusField("");
              handleBlur("fullName", fullName);
            }}
            accessibilityLabel="Nome completo"
          />
          <Animated.View
            style={[
              styles.bar,
              {
                width: fullNameBarWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        {/* Nome de Utilizador */}
        <View style={styles.wrapInput}>
          <Text
            nativeID="usernameLabel"
            style={styles.subtitles}
            accessibilityRole="text"
            accessibilityLabel="Nome de Utilizador"
          >
            Nome de Utilizador{" "}
            <Text nativeID="mandatory" style={styles.mandatory}>
              *
            </Text>
          </Text>
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
            accessibilityLabel="Nome de utilizador"
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

        {/* Email */}
        <View style={styles.wrapInput}>
          <Text
            nativeID="emailLabel"
            style={styles.subtitles}
            accessibilityRole="text"
            accessibilityLabel="Endereço de E-mail"
          >
            Endereço de E-mail{" "}
            <Text nativeID="mandatory" style={styles.mandatory}>
              *
            </Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              (focusField === "email" || email) && styles.focusedInput,
            ]}
            placeholder="exemplo@email.com"
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
            accessibilityLabel="Endereço de email"
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

        {/* Password */}
        <View style={styles.wrapInput}>
          <Text
            nativeID="passwordLabel"
            style={styles.subtitles}
            accessibilityRole="text"
            accessibilityLabel="Palavra-passe"
          >
            Palavra-passe{" "}
            <Text nativeID="mandatory" style={styles.mandatory}>
              *
            </Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              (focusField === "password" || password) && styles.focusedInput,
            ]}
            placeholder="Defina a sua palavra-passe"
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

        {/* Confirmar Password */}
        <View style={styles.wrapInput}>
          <Text
            nativeID="passwordLabel"
            style={styles.subtitles}
            accessibilityRole="text"
            accessibilityLabel="Confirmar Palavra-passe"
          >
            Confirmar Palavra-passe{" "}
            <Text nativeID="mandatory" style={styles.mandatory}>
              *
            </Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              (focusField === "confirmPassword" || confirmPassword) &&
                styles.focusedInput,
            ]}
            placeholder="Reescreva a palavra-passe"
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
            accessibilityLabel="Confirmar palavra-passe"
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

        {/* Gênero */}
        <View style={styles.wrapInput}>
          <Text
            style={styles.subtitles}
            accessibilityRole="text"
            accessibilityLabel="Género"
          >
            Género{" "}
            <Text nativeID="mandatory" style={styles.mandatory}>
              *
            </Text>
          </Text>
          <BotaoNavegacaoContainer>
            <Definir_visibilidade_btn
              accessibilityRole="button"
              style={{
                backgroundColor:
                  activeButton === "Masculino" ? "#E3FC87" : "white",
              }}
              onPress={() => handleButtonClick("Masculino")}
            >
              <Texto_Botoes_Definir_Visibilidade>
                Masculino
              </Texto_Botoes_Definir_Visibilidade>
            </Definir_visibilidade_btn>
            <Definir_visibilidade_btn
              accessibilityRole="button"
              style={{
                backgroundColor:
                  activeButton === "Feminino" ? "#E3FC87" : "white",
              }}
              onPress={() => handleButtonClick("Feminino")}
            >
              <Texto_Botoes_Definir_Visibilidade>
                Feminino
              </Texto_Botoes_Definir_Visibilidade>
            </Definir_visibilidade_btn>
          </BotaoNavegacaoContainer>
        </View>

        {/* Termos e Condições */}
        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              { backgroundColor: termsAccepted ? '#E3FC87' : 'transparent' }
            ]}
            onPress={() => {
              setTermsAccepted(!termsAccepted);
              setTouchedTerms(true);
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: termsAccepted }}
          >
            {termsAccepted && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            Aceito os{' '}
            <Text style={styles.termsLink} onPress={() => router.push("./termos")}>
              Termos e Condições
            </Text>
          </Text>
        </View>

        {/* Mensagem de Erro */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Botão de Registro */}
        <TouchableOpacity
          style={[styles.loginButton, !termsAccepted && { opacity: 0.5 }]}
          onPress={handleSubmit}
          accessibilityRole="button"
          disabled={!termsAccepted}
        >
          <Text style={styles.loginButtonText} accessibilityLabel="Registar-me">
            Registar-me
          </Text>
        </TouchableOpacity>

        {/* Link para Login */}
        <View style={styles.textCenter}>
          <Text
            style={styles.txt1}
            accessibilityRole="text"
            accessibilityLabel="Já tens uma conta?"
          >
            Já tens uma conta?
          </Text>
          <TouchableOpacity onPress={() => router.push("./login")}>
            <Text
              style={styles.txt2}
              accessibilityRole="link"
              accessibilityLabel="Iniciar sessão"
            >
              Iniciar sessão
            </Text>
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
  h1: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#E3FC87",
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
    fontWeight: "400",
  },
  errorText: {
    color: "#FFBDBD",
    fontSize: 14,
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
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
    fontWeight: "500",
  },
  mandatory: {
    color: "#FF8F8F",
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E3FC87',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#263A83',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    color: '#adadad',
    fontSize: 14,
    marginLeft: 8,
  },
  termsLink: {
    color: '#E3FC87',
    textDecorationLine: 'underline',
  },
});
