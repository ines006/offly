import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {View, ActivityIndicator} from "react-native";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const userData = await AsyncStorage.getItem("user");

        console.log("🔐 TOKEN:", token);
        console.log("👤 USER DATA:", userData);

        if (token && userData) {
          setAccessToken(token);
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.log("Erro ao carregar dados do utilizador:", e.message);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, loading }}>
      {loading ? (
        // Podes meter aqui o teu splash screen ou loader personalizado
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
