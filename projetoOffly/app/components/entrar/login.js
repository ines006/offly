import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseurl } from "../../api-config/apiConfig";
import { AuthContext } from "./AuthContext"; 

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
  const { setUser, setAccessToken, setRefreshToken, setLoading } =
    useContext(AuthContext);

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
      console.log("🔄 Iniciando login com baseurl:", baseurl);
      const response = await axios.post(`${baseurl}/auth/login`, {
        email,
        password,
      });

      const { token, refreshToken, user } = response.data;

      console.log("✅ Login efetuado com sucesso!");
      console.log("🔑 Dados do login:", { token, refreshToken, user });

      if (!user?.id) {
        console.error("❌ Erro: user.id não encontrado na resposta do login");
        throw new Error("ID do utilizador não encontrado");
      }

      await AsyncStorage.setItem("accessToken", token);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setAccessToken(token);
      setRefreshToken(refreshToken);
      setLoading(false);
      console.log("🔍 RefreshToken salvo no AuthContext:", refreshToken);

      const participantUrl = `${baseurl}/participants/${user.id}`;
      console.log("🔄 Verificando equipa no endpoint:", participantUrl);

      const participantResponse = await axios.get(participantUrl, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("👥 Resposta do participante:", participantResponse.data);
      const teamId = participantResponse.data.teams_id;
      const hasTeam = teamId !== null && teamId !== undefined && teamId !== "";
      console.log("👥 Utilizador tem equipa?", hasTeam, "teamId:", teamId);

      if (!hasTeam) {
        console.log("🚪 Redirecionando para: /PaginaPrincipal (sem equipa)");
        try {
          router.push("/PaginaPrincipal");
        } catch (navError) {
          console.error("❌ Erro de navegação para /PaginaPrincipal:", navError);
        }
        return;
      }

      try {
        if (!teamId) {
          console.error("❌ teamId inválido:", teamId);
          try {
            router.push("/PaginaPrincipal");
          } catch (navError) {
            console.error("❌ Erro de navegação para /PaginaPrincipal:", navError);
          }
          return;
        }

        const teamResponse = await axios.get(`${baseurl}/teams/${teamId}?t=${Date.now()}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            "Cache-Control": "no-cache",
          },
        });

        console.log("📊 Resposta da equipa:", teamResponse.data);
        const hasCompetition = teamResponse.data.competition_id !== null && teamResponse.data.competition_id !== undefined;
        console.log("🏆 Equipa tem competição?", hasCompetition);

        if (hasCompetition) {
          const isAdmin = teamResponse.data.team_admin?.id === user.id;
          console.log("👑 Utilizador é admin da equipa?", isAdmin, "team_admin.id:", teamResponse.data.team_admin?.id, "user.id:", user.id);

          if (isAdmin) {
            console.log("🚪 Redirecionando para: /components/navbar (admin com competição)");
            try {
              router.push("/components/navbar");
            } catch (navError) {
              console.error("❌ Erro de navegação para /components/navbar:", navError);
              router.push("/PaginaPrincipal"); // Fallback
            }
          } else {
            console.log("🚪 Redirecionando para: /components/navbar (não admin com competição)");
            try {
              router.push("/components/navbar");
            } catch (navError) {
              console.error("❌ Erro de navegação para /components/navbar:", navError);
              router.push("/PaginaPrincipal"); // Fallback
            }
          }
        } else {
          console.log("🚪 Redirecionando para: /EquipaCriada (sem competição) com teamId:", teamId);
          try {
            router.push({ pathname: "/EquipaCriada", params: { teamId } });
          } catch (navError) {
            console.error("❌ Erro de navegação para /EquipaCriada:", navError);
            router.push("/PaginaPrincipal"); // Fallback
          }
        }
      } catch (teamError) {
        console.error("❌ Erro ao buscar dados da equipa:", {
          message: teamError.message,
          status: teamError.response?.status,
          data: teamError.response?.data,
        });
        console.log("🚪 Redirecionando fallback para: /PaginaPrincipal (erro na API de equipa)");
        try {
          router.push("/PaginaPrincipal");
        } catch (navError) {
          console.error("❌ Erro de navegação para /PaginaPrincipal:", navError);
        }
      }
    } catch (err) {
      console.error("❌ Erro ao fazer login:", err.response?.data || err.message);
      setError(
        "O email ou a palavra-passe que preencheste não são válidos. Tenta novamente!"
      );
    }
  };

  return (
    <View accessibilityRole="main" style={styles.container}>
      <View style={styles.wrapLogin}>
        <Text style={styles.text} accessibilityRole="header">
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
            onPress={() => router.push("./registo")}
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
  text: {
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