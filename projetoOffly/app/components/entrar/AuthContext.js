import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("accessToken");
        const storedRefreshToken = await AsyncStorage.getItem("refreshToken");
        const storedUser = await AsyncStorage.getItem("user");

        console.log("🔍 Carregando dados do AsyncStorage:", {
          storedToken,
          storedRefreshToken,
          storedUser,
        });

        if (storedToken && storedRefreshToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && typeof parsedUser === "object" && parsedUser.id) {
              setAccessToken(storedToken);
              setRefreshToken(storedRefreshToken);
              setUser(parsedUser);
            } else {
              console.warn("⚠️ Dados do usuário inválidos no AsyncStorage");
              await AsyncStorage.clear();
            }
          } catch (parseError) {
            console.error(
              "❌ Erro ao parsear dados do AsyncStorage:",
              parseError
            );
            await AsyncStorage.clear();
          }
        }
      } catch (error) {
        console.error("❌ Erro ao carregar dados do AsyncStorage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("user");
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      console.log("🔓 Logout realizado no AuthContext");
    } catch (error) {
      console.error("❌ Erro ao fazer logout no AsyncStorage:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        refreshToken,
        setRefreshToken,
        loading,
        setLoading,
        logout,
      }}
    >
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
