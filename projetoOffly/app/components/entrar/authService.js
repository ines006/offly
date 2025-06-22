import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseurl } from "../../api-config/apiConfig";

export const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) return null;

    const response = await axios.post(`${baseurl}/auth/refresh`, {
      refreshToken,
    });

    const { token } = response.data;
    await AsyncStorage.setItem("accessToken", token);

    return token;
  } catch (err) {
    console.error("Erro ao fazer refresh do token:", err.message);
    return null;
  }
};

export const logout = async () => {
  await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
};
